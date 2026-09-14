const CLASSIC_API = "https://fantasy.premierleague.com/api";

export const CLASSIC_LEAGUE_ID = process.env.FPL_CLASSIC_LEAGUE_ID ?? "867431";
export const CLASSIC_ENTRY_ID = Number(process.env.FPL_CLASSIC_ENTRY_ID ?? "7053865");

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

function mapClassicRoster(picks, { elements, teams, positions }) {
  return (picks?.picks ?? []).map((p) => {
    const el = elements.get(p.element);
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
    };
  });
}

async function getClassicRefData() {
  const bootstrap = await fetchJson(`${CLASSIC_API}/bootstrap-static/`);
  const currentGw = bootstrap.events.find((e) => e.is_current)?.id ?? null;
  return {
    bootstrap,
    currentGw,
    elements: new Map(bootstrap.elements.map((e) => [e.id, e])),
    teams: new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    positions: new Map(bootstrap.element_types.map((t) => [t.id, t.singular_name_short])),
  };
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
    currentGw
      ? tryFetchJson(`${CLASSIC_API}/entry/${CLASSIC_ENTRY_ID}/event/${currentGw}/picks/`)
      : null,
  ]);

  const now = Date.now();
  const nextEvent = bootstrap.events.find(
    (e) => new Date(e.deadline_time).getTime() > now
  );

  const standings = league.standings.results.map((r) => ({
    entryId: r.entry,
    teamName: r.entry_name,
    manager: r.player_name,
    rank: r.rank,
    gwPoints: r.event_total,
    total: r.total,
  }));

  return {
    leagueName: league.league.name,
    myEntryId: CLASSIC_ENTRY_ID,
    currentGw,
    nextGwName: nextEvent?.name ?? null,
    nextGwDeadline: formatDeadline(nextEvent?.deadline_time),
    gwPoints: picks?.entry_history?.points ?? null,
    totalPoints: picks?.entry_history?.total_points ?? null,
    overallRank: picks?.entry_history?.overall_rank ?? null,
    bank: (picks?.entry_history?.bank ?? 0) / 10,
    value: (picks?.entry_history?.value ?? 0) / 10,
    standings,
    roster: mapClassicRoster(picks, ref),
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
    currentGw ? tryFetchJson(`${CLASSIC_API}/entry/${entryId}/event/${currentGw}/picks/`) : null,
  ]);
  if (!entryInfo) return null;

  return {
    teamName: entryInfo.name,
    manager: `${entryInfo.player_first_name} ${entryInfo.player_last_name}`,
    currentGw,
    roster: mapClassicRoster(picks, ref),
    hasLineupOrder: Boolean(picks?.picks?.length),
  };
}
