import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchupDetail } from "@/lib/fpl-draft";
import RosterList from "@/components/RosterList";

function TeamHeader({ team, winning, align }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className={`block text-lg font-bold ${winning ? "text-ink" : "text-ink-dim"}`}>
        {team.teamName}
      </span>
      <span className="text-xs text-ink-dim">{team.manager}</span>
    </div>
  );
}

export default async function MatchupDetailPage({ params, searchParams }) {
  const { matchId } = await params;
  const { gw } = await searchParams;
  const [entryIdA, entryIdB] = matchId.split("-").map(Number);

  if (!entryIdA || !entryIdB) notFound();

  const gwParam = Number(gw);
  const data = await getMatchupDetail(
    entryIdA,
    entryIdB,
    Number.isInteger(gwParam) ? gwParam : undefined
  );
  if (!data) notFound();

  const { team1, team2, started, finished } = data;
  const team1Winning = started && team1.points > team2.points;
  const team2Winning = started && team2.points > team1.points;

  const team1Proj = team1.points + team1.remaining.points;
  const team2Proj = team2.points + team2.remaining.points;
  const team1ProjAhead = team1Proj > team2Proj;
  const team2ProjAhead = team2Proj > team1Proj;
  const team1ExpAhead = team1.expectedTotal > team2.expectedTotal;
  const team2ExpAhead = team2.expectedTotal > team1.expectedTotal;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <Link
        href={`/matchups?gw=${data.currentGw}`}
        className="mb-4 inline-block text-xs font-semibold uppercase tracking-wide text-ink-dim hover:text-ink"
      >
        &larr; All matchups
      </Link>

      <div className="mb-6 rounded-md border border-pitch-border bg-pitch-surface p-5 shadow-lg sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              finished
                ? "bg-ink text-pitch-bg"
                : started
                  ? "bg-danger/20 text-danger"
                  : "bg-pitch-surface2 text-ink-dim"
            }`}
          >
            {finished ? "Final" : started ? "Live" : "Upcoming"}
          </span>
          <span className="font-display text-sm font-bold text-ink-dim">
            GW{data.currentGw}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <TeamHeader team={team1} winning={team1Winning} align="left" />
          </div>
          <div className="flex flex-col items-center gap-1.5 font-mono">
            <div className="flex items-center gap-2 text-xs">
              <span className={team1ExpAhead ? "font-semibold text-ink" : "text-ink-dim"}>
                {team1.expectedTotal.toFixed(1)}
              </span>
              <span className="text-ink-dim">exp</span>
              <span className={team2ExpAhead ? "font-semibold text-ink" : "text-ink-dim"}>
                {team2.expectedTotal.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${team1Winning ? "text-ink" : "text-ink-dim"}`}>
                {started ? team1.points : "–"}
              </span>
              <span className="text-ink-dim">&ndash;</span>
              <span className={`text-4xl font-bold ${team2Winning ? "text-ink" : "text-ink-dim"}`}>
                {started ? team2.points : "–"}
              </span>
            </div>
            {!finished && (
              <div className="flex items-center gap-2 text-xs">
                <span className={team1ProjAhead ? "font-semibold text-gold" : "text-ink-dim"}>
                  {team1Proj.toFixed(1)}
                </span>
                <span className="text-ink-dim">proj</span>
                <span className={team2ProjAhead ? "font-semibold text-gold" : "text-ink-dim"}>
                  {team2Proj.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <TeamHeader team={team2} winning={team2Winning} align="right" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[team1, team2].map((team) => (
          <section
            key={team.entryId}
            className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg"
          >
            <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                {team.teamName}
              </h2>
              <span className="text-xs text-ink-dim">GW{data.currentGw} pts</span>
            </div>
            <RosterList
              roster={team.roster}
              hasLineupOrder={team.hasLineupOrder}
              currentGw={data.currentGw}
            />
          </section>
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
