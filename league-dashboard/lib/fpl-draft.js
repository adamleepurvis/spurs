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

/**
 * Pulls together standings + squad for the draft league into the shape
 * the dashboard page renders. Ownership-based roster reconstruction is
 * used as a fallback for the rare window where a gameweek's picks
 * haven't published yet even though it's flagged "current".
 */
export async function getDraftDashboard() {
  const [bootstrap, league, elementStatus] = await Promise.all([
    fetchJson(`${DRAFT_API}/bootstrap-static`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/details`),
    fetchJson(`${DRAFT_API}/league/${LEAGUE_ID}/element-status`),
  ]);

  const elements = new Map(bootstrap.elements.map((e) => [e.id, e]));
  const teams = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
  const positions = new Map(
    bootstrap.element_types.map((t) => [t.id, t.singular_name_short])
  );
  const entries = new Map(
    league.league_entries.map((e) => [e.id, e])
  );
  const ownerByElement = new Map(
    elementStatus.element_status.map((s) => [s.element, s.owner])
  );

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

  let picks =
    (await tryFetchJson(`${DRAFT_API}/entry/${MY_ENTRY_ID}/event/${currentEvent}`)) ??
    (await tryFetchJson(`${DRAFT_API}/entry/${MY_ENTRY_ID}/event/${currentEvent - 1}`));

  let roster;
  if (picks?.picks) {
    roster = picks.picks.map((p) => {
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
  } else {
    // Fallback: reconstruct from ownership when picks aren't published yet.
    roster = bootstrap.elements
      .filter((el) => ownerByElement.get(el.id) === MY_ENTRY_ID)
      .map((el) => ({
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

  return {
    leagueName: league.league.name,
    myEntryId: MY_ENTRY_ID,
    myTeamName: myLeagueEntry?.entry_name ?? "My Team",
    currentGw: currentEvent,
    nextGwName: nextEvent?.name ?? null,
    nextGwDeadline: formatDeadline(nextEvent?.deadline_time),
    standings,
    roster,
    hasLineupOrder: Boolean(picks?.picks),
  };
}
