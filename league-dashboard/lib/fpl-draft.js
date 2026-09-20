const DRAFT_API = "https://draft.premierleague.com/api";
const CLASSIC_API = "https://fantasy.premierleague.com/api";

export const LEAGUE_ID = process.env.FPL_DRAFT_LEAGUE_ID ?? "42004";
export const MY_ENTRY_ID = Number(process.env.FPL_DRAFT_ENTRY_ID ?? "261801");

const FETCH_TIMEOUT_MS = 8000;
const FETCH_RETRIES = 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The FPL APIs (all unofficial) occasionally blip - a timeout, a
 * one-off 5xx, a dropped connection - from Vercel's network even when
 * they're perfectly healthy from elsewhere. Retry a couple of times
 * before giving up rather than failing the whole page on one bad beat.
 */
async function fetchJson(url) {
  let lastError;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        lastError = new Error(`${url} -> ${res.status}`);
      } else {
        return await res.json();
      }
    } catch (err) {
      lastError = err;
    }
    if (attempt < FETCH_RETRIES) await sleep(300 * (attempt + 1));
  }
  throw lastError;
}

async function tryFetchJson(url) {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

function formatDeadline(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

/**
 * team_id -> { opponentTeamId, isHome, started, finished } for one
 * gameweek. Uses the classic FPL API since the draft API's own
 * bootstrap.fixtures drops a gameweek once it becomes current.
 */
async function getFixtureMapForGw(gw) {
  const fixtures = await fetchJson(`${CLASSIC_API}/fixtures/?event=${gw}`);
  const map = new Map();
  for (const f of fixtures) {
    map.set(f.team_h, {
      opponentTeamId: f.team_a,
      isHome: true,
      started: f.started,
      finished: f.finished,
      live: Boolean(f.started && !f.finished_provisional),
    });
    map.set(f.team_a, {
      opponentTeamId: f.team_h,
      isHome: false,
      started: f.started,
      finished: f.finished,
      live: Boolean(f.started && !f.finished_provisional),
    });
  }
  return map;
}

function enrichPlayer(el, { teams, fixtureMap, epNextByCode }) {
  const fixture = fixtureMap.get(el.team);
  const epNextRaw = epNextByCode.get(el.code);
  return {
    code: el.code,
    team: teams.get(el.team),
    opponentTeam: fixture ? teams.get(fixture.opponentTeamId) : null,
    opponentIsHome: fixture?.isHome ?? null,
    fixtureStarted: fixture?.started ?? null,
    fixtureFinished: fixture?.finished ?? null,
    fixtureLive: fixture?.live ?? false,
    epNext: epNextRaw != null ? Number(epNextRaw) : null,
  };
}

function mapElementsForRoster(picksOrElements, isRealPicks, ref) {
  const { elements, positions } = ref;
  if (isRealPicks) {
    return picksOrElements.map((p) => {
      const el = elements.get(p.element);
      return {
        name: el.web_name,
        pos: positions.get(el.element_type),
        ...enrichPlayer(el, ref),
        eventPoints: el.event_points,
        status: el.status,
        news: el.news,
        isCaptain: p.is_captain,
        isViceCaptain: p.is_vice_captain,
        positionSlot: p.position,
      };
    });
  }
  return picksOrElements.map((el) => ({
    name: el.web_name,
    pos: positions.get(el.element_type),
    ...enrichPlayer(el, ref),
    eventPoints: el.event_points,
    status: el.status,
    news: el.news,
    isCaptain: false,
    isViceCaptain: false,
    positionSlot: null,
  }));
}

/**
 * Builds one entry's roster for a gameweek, preferring the real picks
 * endpoint (which carries starting XI / bench order and captaincy) and
 * falling back to ownership-based reconstruction for the rare window
 * where a gameweek's picks haven't published yet even though it's
 * flagged "current".
 */
async function buildRoster(entryId, currentEvent, ref) {
  const currentSquadIds = new Set(
    Array.from(ref.elements.values())
      .filter((el) => ref.ownerByElement.get(el.id) === entryId)
      .map((el) => el.id)
  );

  const picks =
    (await tryFetchJson(`${DRAFT_API}/entry/${entryId}/event/${currentEvent}`)) ??
    (await tryFetchJson(`${DRAFT_API}/entry/${entryId}/event/${currentEvent - 1}`));

  // A locked picks snapshot only reflects reality if it's still the same
  // 15 players you currently own - once picks fall back to last
  // gameweek's lineup, any waiver move since then makes that snapshot
  // stale (it'll still list a player you've since dropped). Ownership
  // via element-status is always live, so treat a mismatch as "no
  // lineup order" and fall back to the current actual squad instead of
  // trusting an outdated locked-in lineup.
  const picksMatchCurrentSquad =
    Boolean(picks?.picks) &&
    picks.picks.length === currentSquadIds.size &&
    picks.picks.every((p) => currentSquadIds.has(p.element));

  const roster = picksMatchCurrentSquad
    ? mapElementsForRoster(picks.picks, true, ref)
    : mapElementsForRoster(
        Array.from(ref.elements.values()).filter((el) => currentSquadIds.has(el.id)),
        false,
        ref
      );

  return { roster, hasLineupOrder: picksMatchCurrentSquad };
}

/**
 * A roster's "remaining" upside: among starters (or the full squad when
 * lineup order isn't published yet), how many haven't kicked off yet
 * this gameweek, and how many expected points are still on the pitch.
 */
function summarizeRemaining(roster, hasLineupOrder) {
  const relevant = hasLineupOrder
    ? roster.filter((p) => p.positionSlot <= 11)
    : roster;
  const remaining = relevant.filter((p) => p.fixtureStarted === false);
  return {
    count: remaining.length,
    points: remaining.reduce((sum, p) => sum + (p.epNext ?? 0), 0),
  };
}

/**
 * The pregame baseline: sum of every starter's expected points for the
 * gameweek, regardless of whether they've since played. Fixed for the
 * whole gameweek, unlike the live score or the "remaining" projection.
 */
function sumExpectedPoints(roster, hasLineupOrder) {
  const relevant = hasLineupOrder
    ? roster.filter((p) => p.positionSlot <= 11)
    : roster;
  return relevant.reduce((sum, p) => sum + (p.epNext ?? 0), 0);
}

/**
 * The API's own `events.current` doesn't advance to the next gameweek
 * the moment the current one finishes - it lags behind by some margin
 * on FPL's side. "First gameweek that hasn't finished yet" tracks what
 * a manager actually wants to see (mid-week during the current one,
 * immediately jumping to the next one once it wraps) much more
 * closely than trusting that flag directly.
 */
function resolveCurrentGw(events) {
  return events.data.find((e) => !e.finished)?.id ?? events.current;
}

async function getSharedRefData(gwOverride) {
  const [bootstrap, league, elementStatus] = await Promise.all([
    fetchJson(`${DRAFT_API}/bootstrap-static`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/details`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/element-status`),
  ]);

  const liveGw = resolveCurrentGw(bootstrap.events);
  const currentEvent = gwOverride ?? liveGw;
  const [fixtureMap, classicBootstrap] = await Promise.all([
    getFixtureMapForGw(currentEvent),
    fetchJson(`${CLASSIC_API}/bootstrap-static/`),
  ]);

  return {
    bootstrap,
    league,
    currentEvent,
    liveGw,
    firstGw: bootstrap.events.data[0].id,
    lastGw: bootstrap.events.data[bootstrap.events.data.length - 1].id,
    fixtureMap,
    epNextByCode: new Map(classicBootstrap.elements.map((e) => [e.code, e.ep_next])),
    elements: new Map(bootstrap.elements.map((e) => [e.id, e])),
    teams: new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    positions: new Map(bootstrap.element_types.map((t) => [t.id, t.singular_name_short])),
    entries: new Map(league.league_entries.map((e) => [e.id, e])),
    ownerByElement: new Map(elementStatus.element_status.map((s) => [s.element, s.owner])),
  };
}

/**
 * Pulls together standings + squad for the draft league into the shape
 * the dashboard page renders.
 */
export async function getDraftDashboard() {
  const ref = await getSharedRefData();
  const { bootstrap, league, entries, currentEvent } = ref;

  const now = Date.now();
  const nextEvent = bootstrap.events.data.find(
    (e) => new Date(e.deadline_time).getTime() > now
  );

  const standings = league.standings.map((s) => {
    const entry = entries.get(s.league_entry);
    return {
      entryId: entry?.entry_id ?? null,
      teamName: entry?.entry_name || `Autopick (${entry?.short_name ?? "?"})`,
      manager: entry?.player_first_name
        ? `${entry.player_first_name} ${entry.player_last_name}`
        : "—",
      rank: s.rank,
      won: s.matches_won,
      drawn: s.matches_drawn,
      lost: s.matches_lost,
      pointsFor: s.points_for,
      pointsAgainst: s.points_against,
      total: s.total,
    };
  });

  // My league_entries "id" (distinct from the entry_id used elsewhere).
  const myLeagueEntry = league.league_entries.find(
    (e) => e.entry_id === MY_ENTRY_ID
  );

  const { roster, hasLineupOrder } = await buildRoster(MY_ENTRY_ID, currentEvent, ref);

  return {
    leagueName: league.league.name,
    myEntryId: MY_ENTRY_ID,
    myTeamName: myLeagueEntry?.entry_name ?? "My Team",
    currentGw: currentEvent,
    nextGwName: nextEvent?.name ?? null,
    nextGwDeadline: formatDeadline(nextEvent?.deadline_time),
    standings,
    roster,
    hasLineupOrder,
  };
}

/**
 * Head-to-head matchups for the current (or most recently started)
 * gameweek, with team/manager names resolved, each entry's live total
 * flagged against its official league_entry_X_points snapshot (which
 * only updates once the match is finished), and each side's "remaining"
 * upside - how many starters haven't kicked off yet and how many
 * expected points are still on the pitch for them.
 */
export async function getMatchups(gwOverride) {
  const ref = await getSharedRefData(gwOverride);
  const { league, entries, currentEvent } = ref;

  const teamInfo = (leagueEntryId) => {
    const entry = entries.get(leagueEntryId);
    return {
      entryId: entry?.entry_id ?? null,
      teamName: entry?.entry_name || `Autopick (${entry?.short_name ?? "?"})`,
      manager: entry?.player_first_name
        ? `${entry.player_first_name} ${entry.player_last_name}`
        : "—",
    };
  };

  const withRemaining = async (leagueEntryId, points) => {
    const info = teamInfo(leagueEntryId);
    if (!info.entryId) {
      return { ...info, points, remaining: { count: 0, points: 0 }, expectedTotal: 0 };
    }
    const { roster, hasLineupOrder } = await buildRoster(info.entryId, currentEvent, ref);
    return {
      ...info,
      points,
      remaining: summarizeRemaining(roster, hasLineupOrder),
      expectedTotal: sumExpectedPoints(roster, hasLineupOrder),
    };
  };

  const relevantMatches = league.matches.filter((m) => m.event === currentEvent);

  const matches = await Promise.all(
    relevantMatches.map(async (m) => {
      const [team1, team2] = await Promise.all([
        withRemaining(m.league_entry_1, m.league_entry_1_points),
        withRemaining(m.league_entry_2, m.league_entry_2_points),
      ]);
      return {
        team1,
        team2,
        started: m.started,
        finished: m.finished,
        involvesMe:
          entries.get(m.league_entry_1)?.entry_id === MY_ENTRY_ID ||
          entries.get(m.league_entry_2)?.entry_id === MY_ENTRY_ID,
      };
    })
  );

  matches.sort((a, b) => (b.involvesMe ? 1 : 0) - (a.involvesMe ? 1 : 0));

  return {
    leagueName: league.league.name,
    currentGw: currentEvent,
    liveGw: ref.liveGw,
    firstGw: ref.firstGw,
    lastGw: ref.lastGw,
    matches,
  };
}

/**
 * Full lineup + score breakdown for one head-to-head matchup, identified
 * by the two entry_ids playing in it (order doesn't matter).
 */
export async function getMatchupDetail(entryIdA, entryIdB, gwOverride) {
  const ref = await getSharedRefData(gwOverride);
  const { league, entries, currentEvent } = ref;

  const match = league.matches.find((m) => {
    if (m.event !== currentEvent) return false;
    const e1 = entries.get(m.league_entry_1)?.entry_id;
    const e2 = entries.get(m.league_entry_2)?.entry_id;
    return (
      (e1 === entryIdA && e2 === entryIdB) || (e1 === entryIdB && e2 === entryIdA)
    );
  });

  if (!match) return null;

  const buildSide = async (leagueEntryId, points) => {
    const entry = entries.get(leagueEntryId);
    const { roster, hasLineupOrder } = await buildRoster(
      entry.entry_id,
      currentEvent,
      ref
    );
    return {
      entryId: entry.entry_id,
      teamName: entry.entry_name || `Autopick (${entry.short_name ?? "?"})`,
      manager: entry.player_first_name
        ? `${entry.player_first_name} ${entry.player_last_name}`
        : "—",
      points,
      roster,
      hasLineupOrder,
      remaining: summarizeRemaining(roster, hasLineupOrder),
      expectedTotal: sumExpectedPoints(roster, hasLineupOrder),
    };
  };

  const [team1, team2] = await Promise.all([
    buildSide(match.league_entry_1, match.league_entry_1_points),
    buildSide(match.league_entry_2, match.league_entry_2_points),
  ]);

  return {
    leagueName: league.league.name,
    currentGw: currentEvent,
    started: match.started,
    finished: match.finished,
    team1,
    team2,
  };
}

const FREE_AGENT_STATUSES = new Set(["a", "d"]);
const POSITION_LIMIT = 20;

/**
 * Undrafted players, grouped by position and ranked by next-gameweek
 * expected points. The draft API's own `ep_next` is always null, so
 * it's cross-referenced from the classic FPL API (same players, same
 * `code` identifier) which computes a real projection.
 */
export async function getFreeAgents() {
  const [bootstrap, elementStatus, classicBootstrap] = await Promise.all([
    fetchJson(`${DRAFT_API}/bootstrap-static`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/element-status`),
    fetchJson(`${CLASSIC_API}/bootstrap-static/`),
  ]);

  const teams = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
  const positions = new Map(
    bootstrap.element_types.map((t) => [t.id, t.singular_name_short])
  );
  const ownerByElement = new Map(
    elementStatus.element_status.map((s) => [s.element, s.owner])
  );
  const epNextByCode = new Map(
    classicBootstrap.elements.map((e) => [e.code, e.ep_next])
  );

  const freeAgents = bootstrap.elements
    .filter(
      (el) =>
        ownerByElement.get(el.id) == null && FREE_AGENT_STATUSES.has(el.status)
    )
    .map((el) => {
      const epNextRaw = epNextByCode.get(el.code);
      const epNext = epNextRaw != null ? Number(epNextRaw) : null;
      return {
        id: el.id,
        name: el.web_name,
        pos: positions.get(el.element_type),
        team: teams.get(el.team),
        totalPoints: el.total_points,
        epNext,
        status: el.status,
        news: el.news,
      };
    });

  const byPosition = {};
  for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
    byPosition[pos] = freeAgents
      .filter((p) => p.pos === pos)
      .sort((a, b) => (b.epNext ?? -1) - (a.epNext ?? -1) || b.totalPoints - a.totalPoints)
      .slice(0, POSITION_LIMIT);
  }

  return {
    currentGw: bootstrap.events.current,
    byPosition,
  };
}

const COPILOT_API = "https://api.fplcopilot.com/api";
const RANKINGS_LIMIT = 50;

/**
 * Rest-of-season rankings sourced from FPL Copilot's public (no-auth)
 * expected-points API, which projects an 8-gameweek rolling window per
 * player - something neither the draft nor classic FPL API provides.
 * Cross-referenced with league ownership by the shared player `code`.
 */
export async function getSeasonRankings() {
  const ref = await getSharedRefData();
  const { elements, entries } = ref;

  const entryByEntryId = new Map(
    ref.league.league_entries
      .filter((e) => e.entry_id)
      .map((e) => [e.entry_id, e])
  );
  const elementByCode = new Map(
    Array.from(elements.values()).map((el) => [el.code, el])
  );

  const [copilotPlayers, meta] = await Promise.all([
    fetchJson(`${COPILOT_API}/expected-points?window=8`),
    fetchJson(`${COPILOT_API}/expected-points/meta`),
  ]);

  const players = copilotPlayers.map((p) => {
    const el = elementByCode.get(p.fpl_code);
    const ownerEntryId = el ? ref.ownerByElement.get(el.id) : null;
    const ownerEntry = ownerEntryId ? entryByEntryId.get(ownerEntryId) : null;

    return {
      id: p.id,
      name: p.name,
      // FPL Copilot's own position labels don't match FPL's GKP/DEF/MID/FWD.
      pos: p.position === "GK" ? "GKP" : p.position,
      team: p.team,
      price: p.price,
      nextGwPoints: p.gameweeks[0]?.points ?? null,
      rosPoints: p.total_points,
      ownerTeamName: ownerEntry?.entry_name ?? null,
      isMine: ownerEntryId === MY_ENTRY_ID,
    };
  });

  const byPosition = {};
  for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
    byPosition[pos] = players
      .filter((p) => p.pos === pos)
      .sort((a, b) => b.rosPoints - a.rosPoints)
      .slice(0, RANKINGS_LIMIT);
  }

  return {
    nextGw: meta.next_gw,
    windowGws: meta.gameweeks.filter((gw) => gw >= meta.next_gw).slice(0, 8),
    lastUpdated: meta.last_updated,
    byPosition,
  };
}

const TRADE_TARGET_LIMIT = 8;

/**
 * Trade targets: players buried on another manager's bench whose
 * rest-of-season projection beats one of your own starters at the
 * same position. A bench player is scoring nothing for its owner, so
 * this is upside they may not be attached to - paired with a guess at
 * what they'd want back, based on their own weakest starting position.
 */
export async function getTradeTargets() {
  const ref = await getSharedRefData();
  const { currentEvent } = ref;

  const copilotPlayers = await fetchJson(`${COPILOT_API}/expected-points?window=8`);
  const rosByCode = new Map(copilotPlayers.map((p) => [p.fpl_code, p.total_points]));
  const rosOf = (p) => (p.code != null ? (rosByCode.get(p.code) ?? 0) : 0);
  const withRos = (roster) => roster.map((p) => ({ ...p, rosPoints: rosOf(p) }));

  const { roster: myRosterRaw, hasLineupOrder: myHasLineup } = await buildRoster(
    MY_ENTRY_ID,
    currentEvent,
    ref
  );
  const myRoster = withRos(myRosterRaw);
  const myStarters = myHasLineup ? myRoster.filter((p) => p.positionSlot <= 11) : myRoster;
  const myBench = myHasLineup ? myRoster.filter((p) => p.positionSlot > 11) : [];

  const myWeakestByPos = {};
  for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
    const atPos = myStarters.filter((p) => p.pos === pos);
    if (!atPos.length) continue;
    myWeakestByPos[pos] = atPos.reduce((min, p) => (p.rosPoints < min.rosPoints ? p : min));
  }
  const myBenchByPos = {};
  for (const p of myBench) {
    if (!myBenchByPos[p.pos] || p.rosPoints > myBenchByPos[p.pos].rosPoints) {
      myBenchByPos[p.pos] = p;
    }
  }

  const otherEntries = ref.league.league_entries.filter(
    (e) => e.entry_id && e.entry_id !== MY_ENTRY_ID
  );

  const candidates = [];
  let skippedTeams = 0;

  await Promise.all(
    otherEntries.map(async (entry) => {
      const { roster: theirRosterRaw, hasLineupOrder: theirHasLineup } = await buildRoster(
        entry.entry_id,
        currentEvent,
        ref
      );
      if (!theirHasLineup) {
        skippedTeams += 1;
        return;
      }
      const theirRoster = withRos(theirRosterRaw);
      const theirStarters = theirRoster.filter((p) => p.positionSlot <= 11);
      const theirBench = theirRoster.filter((p) => p.positionSlot > 11);

      let theirWeakest = null;
      for (const p of theirStarters) {
        if (!theirWeakest || p.rosPoints < theirWeakest.rosPoints) theirWeakest = p;
      }

      const ownerTeamName =
        entry.entry_name || `Autopick (${entry.short_name ?? "?"})`;

      for (const benchPlayer of theirBench) {
        const myWeak = myWeakestByPos[benchPlayer.pos];
        if (!myWeak || benchPlayer.rosPoints <= myWeak.rosPoints) continue;

        candidates.push({
          name: benchPlayer.name,
          team: benchPlayer.team,
          pos: benchPlayer.pos,
          rosPoints: benchPlayer.rosPoints,
          ownerTeamName,
          replacesName: myWeak.name,
          replacesRos: myWeak.rosPoints,
          delta: benchPlayer.rosPoints - myWeak.rosPoints,
          theirWeakPos: theirWeakest?.pos ?? null,
          theirWeakName: theirWeakest?.name ?? null,
          theirWeakRos: theirWeakest?.rosPoints ?? null,
          suggestedOffer: theirWeakest
            ? (myBenchByPos[theirWeakest.pos]?.name ?? null)
            : null,
        });
      }
    })
  );

  candidates.sort((a, b) => b.delta - a.delta);

  const byPosition = {};
  for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
    byPosition[pos] = candidates
      .filter((c) => c.pos === pos)
      .slice(0, TRADE_TARGET_LIMIT);
  }

  return {
    currentGw: currentEvent,
    myHasLineup,
    skippedTeams,
    byPosition,
  };
}

const FORMATION_MIN = { DEF: 3, MID: 2, FWD: 1 };

/**
 * The highest-epNext starting XI available under formation rules (1 GK,
 * 3-5 DEF, 2-5 MID, 1-3 FWD - draft squads are always exactly 2/5/5/3,
 * so no upper-bound check is needed once minimums are met), diffed
 * against your actual current lineup.
 */
export async function getStartSitSuggestions() {
  const ref = await getSharedRefData();
  const { currentEvent } = ref;

  const { roster, hasLineupOrder } = await buildRoster(MY_ENTRY_ID, currentEvent, ref);

  const byPos = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const p of roster) byPos[p.pos].push(p);
  for (const pos in byPos) {
    byPos[pos].sort((a, b) => (b.epNext ?? -1) - (a.epNext ?? -1));
  }

  // Exactly one GK always starts: the better of the two.
  const optimalGk = byPos.GKP[0];

  // Take each outfield position's minimum first, then fill the
  // remaining slots with whoever's left over with the highest epNext.
  const outfieldPositions = ["DEF", "MID", "FWD"];
  const included = new Set();
  for (const pos of outfieldPositions) {
    for (let i = 0; i < FORMATION_MIN[pos]; i++) {
      if (byPos[pos][i]) included.add(byPos[pos][i]);
    }
  }
  const remainingSlots = 10 - included.size;
  const pool = outfieldPositions
    .flatMap((pos) => byPos[pos].filter((p) => !included.has(p)))
    .sort((a, b) => (b.epNext ?? -1) - (a.epNext ?? -1));
  for (let i = 0; i < remainingSlots && i < pool.length; i++) {
    included.add(pool[i]);
  }

  const optimalStarters = [optimalGk, ...included].filter(Boolean);
  const optimalSet = new Set(optimalStarters);

  const currentStarters = hasLineupOrder
    ? roster.filter((p) => p.positionSlot <= 11)
    : [];
  const currentSet = new Set(currentStarters);

  const shouldBench = currentStarters.filter((p) => !optimalSet.has(p));
  const shouldStart = optimalStarters.filter((p) => !currentSet.has(p));

  const currentTotal = currentStarters.reduce((sum, p) => sum + (p.epNext ?? 0), 0);
  const optimalTotal = optimalStarters.reduce((sum, p) => sum + (p.epNext ?? 0), 0);

  const posOrder = { GKP: 0, DEF: 1, MID: 2, FWD: 3 };
  const optimalBench = roster
    .filter((p) => !optimalSet.has(p))
    .sort((a, b) => posOrder[a.pos] - posOrder[b.pos] || (b.epNext ?? -1) - (a.epNext ?? -1));

  return {
    currentGw: currentEvent,
    hasLineupOrder,
    optimalStarters,
    optimalBench,
    shouldStart,
    shouldBench,
    currentTotal,
    optimalTotal,
    gain: optimalTotal - currentTotal,
  };
}

/**
 * A single other team's roster, for the "click a team, see their squad"
 * link off the standings table.
 */
export async function getTeamRoster(entryId) {
  const ref = await getSharedRefData();
  const { league, currentEvent } = ref;

  const entry = league.league_entries.find((e) => e.entry_id === entryId);
  if (!entry) return null;

  const { roster, hasLineupOrder } = await buildRoster(entryId, currentEvent, ref);

  return {
    leagueName: league.league.name,
    teamName: entry.entry_name || `Autopick (${entry.short_name ?? "?"})`,
    manager: entry.player_first_name
      ? `${entry.player_first_name} ${entry.player_last_name}`
      : "—",
    currentGw: currentEvent,
    roster,
    hasLineupOrder,
  };
}

const OPTIMIZER_CANDIDATES_PER_POS = 5;

/**
 * Ranks every plausible waiver swap (drop one of your 15, add a free
 * agent at the same position) by rest-of-season gain, pairing your
 * Nth-weakest player at a position against the Nth-best free agent
 * there. Sorted globally, so "your best plan for K moves" is just the
 * first K rows - each row uses a distinct one of your players and a
 * distinct free agent, so there's no overlap to resolve.
 */
export async function getRosterOptimizer() {
  const ref = await getSharedRefData();
  const { currentEvent } = ref;

  const copilotPlayers = await fetchJson(`${COPILOT_API}/expected-points?window=8`);
  const rosByCode = new Map(copilotPlayers.map((p) => [p.fpl_code, p.total_points]));
  const rosOf = (p) => (p.code != null ? (rosByCode.get(p.code) ?? 0) : 0);

  const { roster: myRosterRaw } = await buildRoster(MY_ENTRY_ID, currentEvent, ref);
  const myRoster = myRosterRaw.map((p) => ({ ...p, rosPoints: rosOf(p) }));

  const freeAgents = Array.from(ref.elements.values())
    .filter(
      (el) =>
        ref.ownerByElement.get(el.id) == null && FREE_AGENT_STATUSES.has(el.status)
    )
    .map((el) => ({
      name: el.web_name,
      pos: ref.positions.get(el.element_type),
      team: ref.teams.get(el.team),
      epNext: (() => {
        const raw = ref.epNextByCode.get(el.code);
        return raw != null ? Number(raw) : null;
      })(),
      rosPoints: rosByCode.get(el.code) ?? 0,
    }));

  const candidates = [];
  for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
    const mine = myRoster
      .filter((p) => p.pos === pos)
      .sort((a, b) => a.rosPoints - b.rosPoints);
    const agents = freeAgents
      .filter((p) => p.pos === pos)
      .sort((a, b) => b.rosPoints - a.rosPoints)
      .slice(0, OPTIMIZER_CANDIDATES_PER_POS);

    const n = Math.min(mine.length, agents.length);
    for (let i = 0; i < n; i++) {
      const gain = agents[i].rosPoints - mine[i].rosPoints;
      if (gain <= 0) break; // mine[] is ascending, so nothing further at this rank helps either
      candidates.push({
        pos,
        out: mine[i],
        in: agents[i],
        gain,
      });
    }
  }

  candidates.sort((a, b) => b.gain - a.gain);

  let running = 0;
  const moves = candidates.map((c, i) => {
    running += c.gain;
    return { ...c, rank: i + 1, cumulativeGain: running };
  });

  return {
    currentGw: currentEvent,
    moves,
  };
}
