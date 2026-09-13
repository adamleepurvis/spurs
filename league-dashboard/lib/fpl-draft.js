const DRAFT_API = "https://draft.premierleague.com/api";

export const LEAGUE_ID = process.env.FPL_DRAFT_LEAGUE_ID ?? "42004";
export const MY_ENTRY_ID = Number(process.env.FPL_DRAFT_ENTRY_ID ?? "261801");

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status}`);
  }
  return res.json();
}

async function tryFetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
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

function mapElementsForRoster(picksOrElements, isRealPicks, elements, teams, positions) {
  if (isRealPicks) {
    return picksOrElements.map((p) => {
      const el = elements.get(p.element);
      return {
        name: el.web_name,
        pos: positions.get(el.element_type),
        team: teams.get(el.team),
        eventPoints: el.event_points,
        totalPoints: el.total_points,
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
    team: teams.get(el.team),
    eventPoints: el.event_points,
    totalPoints: el.total_points,
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
async function buildRoster(entryId, currentEvent, { elements, teams, positions, ownerByElement }) {
  const picks =
    (await tryFetchJson(`${DRAFT_API}/entry/${entryId}/event/${currentEvent}`)) ??
    (await tryFetchJson(`${DRAFT_API}/entry/${entryId}/event/${currentEvent - 1}`));

  const hasLineupOrder = Boolean(picks?.picks);
  const roster = hasLineupOrder
    ? mapElementsForRoster(picks.picks, true, elements, teams, positions)
    : mapElementsForRoster(
        Array.from(elements.values()).filter((el) => ownerByElement.get(el.id) === entryId),
        false,
        elements,
        teams,
        positions
      );

  return { roster, hasLineupOrder };
}

async function getSharedRefData() {
  const [bootstrap, league, elementStatus] = await Promise.all([
    fetchJson(`${DRAFT_API}/bootstrap-static`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/details`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/element-status`),
  ]);

  return {
    bootstrap,
    league,
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
  const { bootstrap, league, entries } = ref;

  const currentEvent = bootstrap.events.current;
  const now = Date.now();
  const nextEvent = bootstrap.events.data.find(
    (e) => new Date(e.deadline_time).getTime() > now
  );

  const standings = league.standings.map((s) => {
    const entry = entries.get(s.league_entry);
    return {
      entryId: s.league_entry,
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
 * gameweek, with team/manager names resolved and each entry's live
 * total flagged against its official league_entry_X_points snapshot
 * (which only updates once the match is finished).
 */
export async function getMatchups() {
  const [bootstrap, league] = await Promise.all([
    fetchJson(`${DRAFT_API}/bootstrap-static`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/details`),
  ]);

  const entries = new Map(league.league_entries.map((e) => [e.id, e]));
  const currentEvent = bootstrap.events.current;

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

  const matches = league.matches
    .filter((m) => m.event === currentEvent)
    .map((m) => ({
      team1: { ...teamInfo(m.league_entry_1), points: m.league_entry_1_points },
      team2: { ...teamInfo(m.league_entry_2), points: m.league_entry_2_points },
      started: m.started,
      finished: m.finished,
      involvesMe:
        entries.get(m.league_entry_1)?.entry_id === MY_ENTRY_ID ||
        entries.get(m.league_entry_2)?.entry_id === MY_ENTRY_ID,
    }));

  matches.sort((a, b) => (b.involvesMe ? 1 : 0) - (a.involvesMe ? 1 : 0));

  return {
    leagueName: league.league.name,
    currentGw: currentEvent,
    matches,
  };
}

/**
 * Full lineup + score breakdown for one head-to-head matchup, identified
 * by the two entry_ids playing in it (order doesn't matter).
 */
export async function getMatchupDetail(entryIdA, entryIdB) {
  const ref = await getSharedRefData();
  const { bootstrap, league, entries } = ref;
  const currentEvent = bootstrap.events.current;

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
