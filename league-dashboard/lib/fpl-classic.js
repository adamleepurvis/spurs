import { getFixtureMapForGw, getLiveMinutes, liveRemainingShare } from "./fpl-draft";

const CLASSIC_API = "https://fantasy.premierleague.com/api";

export const CLASSIC_LEAGUE_ID = process.env.FPL_CLASSIC_LEAGUE_ID ?? "867431";
export const CLASSIC_ENTRY_ID = Number(process.env.FPL_CLASSIC_ENTRY_ID ?? "7053865");

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
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function mapClassicRoster(picks, { elements, teams, positions, fixtureMap, live }) {
  return (picks?.picks ?? []).map((p) => {
    const el = elements.get(p.element);
    const fixture = fixtureMap.get(el.team);
    const epNext = el.ep_next != null ? Number(el.ep_next) : null;
    return {
      name: el.web_name,
      pos: positions.get(el.element_type),
      team: teams.get(el.team),
      cost: el.now_cost / 10,
      eventPoints: el.event_points,
      totalPoints: el.total_points,
      form: el.form,
      status: el.status,
      news: el.news,
      isCaptain: p.is_captain,
      isViceCaptain: p.is_vice_captain,
      multiplier: p.multiplier,
      positionSlot: p.position,
      opponentTeam: fixture ? teams.get(fixture.opponentTeamId) : null,
      opponentIsHome: fixture?.isHome ?? null,
      fixtureStarted: fixture?.started ?? null,
      fixtureLive: fixture?.live ?? false,
      epNext,
      liveRemainingXp:
        fixture?.live && epNext != null ? epNext * liveRemainingShare(el, live) : 0,
    };
  });
}

/**
 * Live gameweek picture for one squad: points so far (captain / chip
 * multipliers applied, minus any transfer hit), the pregame xPts
 * baseline, and the projection = points so far + what's still to come
 * from players yet to kick off or mid-match. Vice-captain promotion and
 * auto-subs only take effect once the gameweek is final, so they aren't
 * modeled here.
 */
function summarizeClassicGw(roster, picks) {
  const hit = picks?.entry_history?.event_transfers_cost ?? 0;
  const counted = roster.filter((p) => p.multiplier > 0);

  const points = counted.reduce((sum, p) => sum + p.eventPoints * p.multiplier, 0) - hit;
  const expectedTotal = counted.reduce((sum, p) => sum + (p.epNext ?? 0) * p.multiplier, 0) - hit;

  let remainingPoints = 0;
  let remainingCount = 0;
  for (const p of counted) {
    const left =
      p.fixtureStarted === false ? (p.epNext ?? 0) : p.liveRemainingXp;
    if (left > 0) {
      remainingPoints += left * p.multiplier;
      remainingCount += 1;
    }
  }

  return {
    points,
    expectedTotal,
    remaining: { count: remainingCount, points: remainingPoints },
    projected: points + remainingPoints,
  };
}

/**
 * Same fix as the draft side: `is_current` lags behind on FPL's end
 * even after the gameweek has fully finished, so derive it from
 * "first gameweek not yet finished" instead of trusting the flag.
 */
function resolveCurrentGw(events) {
  return (
    events.find((e) => !e.finished)?.id ?? events.find((e) => e.is_current)?.id ?? null
  );
}

async function getClassicRefData() {
  const bootstrap = await fetchJson(`${CLASSIC_API}/bootstrap-static/`);
  const currentGw = resolveCurrentGw(bootstrap.events);
  const fixtureMap = currentGw ? await getFixtureMapForGw(currentGw) : new Map();
  const live = await getLiveMinutes(currentGw, fixtureMap, bootstrap);
  return {
    bootstrap,
    currentGw,
    fixtureMap,
    live,
    elements: new Map(bootstrap.elements.map((e) => [e.id, e])),
    teams: new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    positions: new Map(bootstrap.element_types.map((t) => [t.id, t.singular_name_short])),
  };
}

/**
 * A gameweek's picks aren't published until its deadline passes - in
 * the gap between one gameweek finishing and the next one locking in,
 * fall back to the last known squad rather than showing nothing.
 */
async function getPicksWithFallback(entryId, gw) {
  if (!gw) return null;
  return (
    (await tryFetchJson(`${CLASSIC_API}/entry/${entryId}/event/${gw}/picks/`)) ??
    (await tryFetchJson(`${CLASSIC_API}/entry/${entryId}/event/${gw - 1}/picks/`))
  );
}

/**
 * Standings + squad for the classic FPL side of things - a separate
 * game from the draft league (budget/transfers, overall points ranking,
 * no head-to-head), so it gets its own simple page rather than sharing
 * the draft league's matchup/trade/lineup machinery.
 */
export async function getClassicDashboard() {
  const ref = await getClassicRefData();
  const { bootstrap, currentGw } = ref;

  const [league, picks] = await Promise.all([
    fetchJson(`${CLASSIC_API}/leagues-classic/${CLASSIC_LEAGUE_ID}/standings/`),
    getPicksWithFallback(CLASSIC_ENTRY_ID, currentGw),
  ]);

  const now = Date.now();
  const nextEvent = bootstrap.events.find(
    (e) => new Date(e.deadline_time).getTime() > now
  );

  // FPL's own standings only catch up as fixtures finish, so rebuild each
  // manager's live GW score + projection from their picks, and shift
  // their total by the difference vs. the official GW figure.
  const standings = (
    await Promise.all(
      league.standings.results.map(async (r) => {
        const entryPicks =
          r.entry === CLASSIC_ENTRY_ID
            ? picks
            : await tryFetchJson(`${CLASSIC_API}/entry/${r.entry}/event/${currentGw}/picks/`);
        const live =
          entryPicks?.entry_history?.event === currentGw
            ? summarizeClassicGw(mapClassicRoster(entryPicks, ref), entryPicks)
            : null;
        return {
          entryId: r.entry,
          teamName: r.entry_name,
          manager: r.player_name,
          gwPoints: live?.points ?? r.event_total,
          projected: live?.projected ?? null,
          total: live ? r.total - r.event_total + live.points : r.total,
        };
      })
    )
  )
    .sort((a, b) => b.total - a.total)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const roster = mapClassicRoster(picks, ref);
  const gw = summarizeClassicGw(roster, picks);
  const picksAreForCurrentGw = picks?.entry_history?.event === currentGw;

  return {
    leagueName: league.league.name,
    myEntryId: CLASSIC_ENTRY_ID,
    currentGw,
    nextGwName: nextEvent?.name ?? null,
    nextGwDeadline: formatDeadline(nextEvent?.deadline_time),
    gwPoints: picksAreForCurrentGw ? gw.points : (picks?.entry_history?.points ?? null),
    gwSummary: picksAreForCurrentGw ? gw : null,
    totalPoints: picks?.entry_history?.total_points ?? null,
    overallRank: picks?.entry_history?.overall_rank ?? null,
    bank: (picks?.entry_history?.bank ?? 0) / 10,
    value: (picks?.entry_history?.value ?? 0) / 10,
    standings,
    roster,
    hasLineupOrder: Boolean(picks?.picks?.length),
  };
}

/**
 * One other classic manager's squad, for the "click a team" link off
 * the standings table.
 */
export async function getClassicTeamRoster(entryId) {
  const ref = await getClassicRefData();
  const { currentGw } = ref;

  const [entryInfo, picks] = await Promise.all([
    tryFetchJson(`${CLASSIC_API}/entry/${entryId}/`),
    getPicksWithFallback(entryId, currentGw),
  ]);
  if (!entryInfo) return null;

  const roster = mapClassicRoster(picks, ref);

  return {
    teamName: entryInfo.name,
    manager: `${entryInfo.player_first_name} ${entryInfo.player_last_name}`,
    currentGw,
    gwSummary: picks?.entry_history?.event === currentGw ? summarizeClassicGw(roster, picks) : null,
    roster,
    hasLineupOrder: Boolean(picks?.picks?.length),
  };
}

const COPILOT_API = "https://api.fplcopilot.com/api";
const CLUB_LIMIT = 3;

/**
 * Ranks the best legal transfer for each of your 15 players by
 * rest-of-season gain: same position, affordable with that player's
 * own sale price plus your current bank, and not pushing any club over
 * the 3-players-per-team cap. Sorted globally, so row N is your
 * optimal plan for exactly N transfers (each swap uses a distinct one
 * of your players, so there's no overlap between rows).
 *
 * Two simplifications worth knowing: sale price is approximated as
 * current market price (the exact sell-on price after profit clawback
 * isn't available without being logged in as this entry), and each
 * swap's budget is figured independently - pooling proceeds from
 * multiple sales into one bigger upgrade isn't modeled.
 */
export async function getClassicRosterOptimizer() {
  const ref = await getClassicRefData();
  const { currentGw, elements, teams, positions } = ref;

  const [picks, copilotPlayers] = await Promise.all([
    getPicksWithFallback(CLASSIC_ENTRY_ID, currentGw),
    fetchJson(`${COPILOT_API}/expected-points?window=8`),
  ]);

  const rosByCode = new Map(copilotPlayers.map((p) => [p.fpl_code, p.total_points]));
  const rosOf = (el) => rosByCode.get(el.code) ?? 0;

  const myPicks = picks?.picks ?? [];
  const myElementIds = new Set(myPicks.map((p) => p.element));
  const bank = (picks?.entry_history?.bank ?? 0) / 10;

  const clubCounts = new Map();
  for (const p of myPicks) {
    const el = elements.get(p.element);
    clubCounts.set(el.team, (clubCounts.get(el.team) ?? 0) + 1);
  }

  const myRoster = myPicks.map((p) => {
    const el = elements.get(p.element);
    return {
      pos: positions.get(el.element_type),
      teamId: el.team,
      name: el.web_name,
      team: teams.get(el.team),
      cost: el.now_cost / 10,
      epNext: el.ep_next != null ? Number(el.ep_next) : null,
      rosPoints: rosOf(el),
    };
  });

  const candidatesByPos = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const el of elements.values()) {
    if (myElementIds.has(el.id)) continue;
    if (el.status !== "a" && el.status !== "d") continue;
    candidatesByPos[positions.get(el.element_type)].push(el);
  }
  for (const pos in candidatesByPos) {
    candidatesByPos[pos].sort((a, b) => rosOf(b) - rosOf(a));
  }

  // Greedily commit the single best (out, candidate) pair available at
  // each step, then remove both from further consideration - otherwise
  // two different weak players could both "want" the same replacement,
  // producing a ranked list that isn't actually executable as a set.
  const usedCandidateIds = new Set();
  let remainingOut = myRoster;
  const moves = [];

  const findBestFor = (out) => {
    const budget = out.cost + bank;
    return candidatesByPos[out.pos].find((el) => {
      if (usedCandidateIds.has(el.id)) return false;
      if (el.now_cost / 10 > budget + 1e-9) return false;
      const countExcludingOut =
        (clubCounts.get(el.team) ?? 0) - (el.team === out.teamId ? 1 : 0);
      return countExcludingOut + 1 <= CLUB_LIMIT;
    });
  };

  while (remainingOut.length > 0) {
    let choice = null; // { out, candidate, gain }
    for (const out of remainingOut) {
      const candidate = findBestFor(out);
      if (!candidate) continue;
      const gain = rosOf(candidate) - out.rosPoints;
      if (gain <= 0) continue;
      if (!choice || gain > choice.gain) choice = { out, candidate, gain };
    }
    if (!choice) break;

    const { out, candidate, gain } = choice;
    usedCandidateIds.add(candidate.id);
    clubCounts.set(out.teamId, (clubCounts.get(out.teamId) ?? 1) - 1);
    clubCounts.set(candidate.team, (clubCounts.get(candidate.team) ?? 0) + 1);
    remainingOut = remainingOut.filter((p) => p !== out);

    moves.push({
      pos: out.pos,
      out,
      in: {
        name: candidate.web_name,
        team: teams.get(candidate.team),
        cost: candidate.now_cost / 10,
        epNext: candidate.ep_next != null ? Number(candidate.ep_next) : null,
        rosPoints: rosOf(candidate),
      },
      costDelta: candidate.now_cost / 10 - out.cost,
      gain,
    });
  }

  let running = 0;
  const ranked = moves.map((m, i) => {
    running += m.gain;
    return { ...m, rank: i + 1, cumulativeGain: running };
  });

  return { currentGw, bank, moves: ranked };
}
