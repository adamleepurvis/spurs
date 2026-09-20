import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchupDetail } from "@/lib/fpl-draft";
import RosterList from "@/components/RosterList";

const fmtPoints = (n) => (Number.isInteger(n) ? n : n.toFixed(1));

function TeamHeader({ team, winning, align }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className={`block text-lg font-bold ${winning ? "text-ink" : "text-ink-dim"}`}>
        {team.teamName}
      </span>
      <span className="text-xs text-ink-dim">
        {team.isAutopick ? "League average" : team.manager}
      </span>
    </div>
  );
}

function AutoSubCallout({ teams }) {
  const rows = teams.flatMap((team) => [
    ...team.autoSubs.confirmed.map((s) => ({ team, kind: "confirmed", ...s })),
    ...team.autoSubs.pending.map((s) => ({ team, kind: "pending", ...s })),
  ]);
  if (!rows.length) return null;

  return (
    <div className="mb-6 rounded-md border border-gold/50 bg-pitch-surface px-4 py-3 text-sm">
      <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-gold">
        Auto-subs
      </div>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={`${r.team.key}-${r.in.name}`} className="text-ink-dim">
            <span className="font-semibold text-ink">{r.team.teamName}</span>:{" "}
            {r.kind === "confirmed" ? (
              <>
                {r.in.name} replaces {r.out.name} &mdash;{" "}
                <span className="font-mono font-semibold text-positive">
                  +{r.in.eventPoints}
                </span>
              </>
            ) : (
              <>
                {r.in.name} would replace {r.out.name} if he plays (
                {r.in.epNext?.toFixed(1) ?? "0.0"} xPts)
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function MatchupDetailPage({
  params,
  searchParams,
  basePath = "/matchups",
}) {
  const { matchId } = await params;
  const { gw } = await searchParams;
  const [keyA, keyB, ...extra] = matchId.split("-");
  const validKey = (k) => /^(\d+|L\d+)$/.test(k ?? "");

  if (extra.length || !validKey(keyA) || !validKey(keyB)) notFound();

  const gwParam = Number(gw);
  const data = await getMatchupDetail(
    keyA,
    keyB,
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
        href={`${basePath}?gw=${data.currentGw}`}
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
                {started ? fmtPoints(team1.points) : "–"}
              </span>
              <span className="text-ink-dim">&ndash;</span>
              <span className={`text-4xl font-bold ${team2Winning ? "text-ink" : "text-ink-dim"}`}>
                {started ? fmtPoints(team2.points) : "–"}
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

      <AutoSubCallout teams={[team1, team2]} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[team1, team2].map((team) => (
          <section
            key={team.key}
            className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg"
          >
            <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                {team.teamName}
              </h2>
              <span className="text-xs text-ink-dim">GW{data.currentGw} pts</span>
            </div>
            {team.isAutopick ? (
              <p className="px-4 py-3 text-xs text-ink-dim">
                Autopick has no squad &mdash; its score is the live average of every
                other team&rsquo;s points and projection this gameweek.
              </p>
            ) : (
              <RosterList
                roster={team.roster}
                hasLineupOrder={team.hasLineupOrder}
                currentGw={data.currentGw}
              />
            )}
          </section>
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
