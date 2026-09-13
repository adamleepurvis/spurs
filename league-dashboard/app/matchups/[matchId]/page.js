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

export default async function MatchupDetailPage({ params }) {
  const { matchId } = await params;
  const [entryIdA, entryIdB] = matchId.split("-").map(Number);

  if (!entryIdA || !entryIdB) notFound();

  const data = await getMatchupDetail(entryIdA, entryIdB);
  if (!data) notFound();

  const { team1, team2, started, finished } = data;
  const team1Winning = started && team1.points > team2.points;
  const team2Winning = started && team2.points > team1.points;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <Link
        href="/matchups"
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
          <div className="flex items-center gap-3 font-mono">
            <span className={`text-4xl font-bold ${team1Winning ? "text-ink" : "text-ink-dim"}`}>
              {started ? team1.points : "–"}
            </span>
            <span className="text-ink-dim">&ndash;</span>
            <span className={`text-4xl font-bold ${team2Winning ? "text-ink" : "text-ink-dim"}`}>
              {started ? team2.points : "–"}
            </span>
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
