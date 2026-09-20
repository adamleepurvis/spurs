import Link from "next/link";
import { getMatchups } from "@/lib/fpl-draft";
import MatchStatusBadge from "@/components/MatchStatusBadge";
import RefreshOnFocus from "@/components/RefreshOnFocus";

const fmtPoints = (n) => (Number.isInteger(n) ? n : n.toFixed(1));

function TeamSide({ team, points, winning, align }) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${
        align === "right" ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <span
        className={`w-full break-words text-base font-semibold ${
          winning ? "text-ink" : "text-ink-dim"
        }`}
      >
        {team.teamName}
      </span>
      <span className="text-[11px] text-ink-dim">
        {team.isAutopick ? "League average" : team.manager}
      </span>
      <span className="mt-1 text-[10.5px] text-ink-dim">
        {team.remaining.count} remaining ({team.remaining.points.toFixed(1)})
      </span>
    </div>
  );
}

function MatchCard({ match, gw, basePath, shared, isPast, fixtureStatus }) {
  const { team1, team2, started, finished } = match;
  const involvesMe = match.involvesMe && !shared;
  const team1Winning = started && team1.points > team2.points;
  const team2Winning = started && team2.points > team1.points;

  const team1Proj = team1.points + team1.remaining.points;
  const team2Proj = team2.points + team2.remaining.points;
  const team1ProjAhead = team1Proj > team2Proj;
  const team2ProjAhead = team2Proj > team1Proj;
  const team1ExpAhead = team1.expectedTotal > team2.expectedTotal;
  const team2ExpAhead = team2.expectedTotal > team1.expectedTotal;

  return (
    <Link
      href={`${basePath}/${team1.key}-${team2.key}?gw=${gw}`}
      className={`block rounded-md border bg-pitch-surface p-5 shadow-lg transition-colors hover:bg-pitch-surface2 ${
        involvesMe ? "border-gold/70 shadow-[0_0_0_1px_rgba(242,181,68,0.3)]" : "border-pitch-border"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <MatchStatusBadge started={started} finished={finished} fixtureStatus={fixtureStatus} />
        {involvesMe && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
            Your match
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <TeamSide team={team1} points={team1.points} winning={team1Winning} align="left" />
        <div className="flex flex-col items-center gap-1.5 font-mono">
          {!isPast && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className={team1ExpAhead ? "font-semibold text-ink" : "text-ink-dim"}>
              {team1.expectedTotal.toFixed(1)}
            </span>
            <span className="text-ink-dim">exp</span>
            <span className={team2ExpAhead ? "font-semibold text-ink" : "text-ink-dim"}>
              {team2.expectedTotal.toFixed(1)}
            </span>
          </div>
          )}
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${team1Winning ? "text-ink" : "text-ink-dim"}`}>
              {started ? fmtPoints(team1.points) : "–"}
            </span>
            <span className="text-sm text-ink-dim">&ndash;</span>
            <span className={`text-3xl font-bold ${team2Winning ? "text-ink" : "text-ink-dim"}`}>
              {started ? fmtPoints(team2.points) : "–"}
            </span>
          </div>
          {!finished && (
            <div className="flex items-center gap-2 text-[11px]">
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
        <TeamSide team={team2} points={team2.points} winning={team2Winning} align="right" />
      </div>
    </Link>
  );
}

function GwNav({ gw, firstGw, lastGw, liveGw, basePath }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={gw > firstGw ? `${basePath}?gw=${gw - 1}` : "#"}
        aria-disabled={gw <= firstGw}
        className={`rounded bg-pitch-surface2 px-2.5 py-1 font-display text-sm font-bold ${
          gw <= firstGw ? "pointer-events-none opacity-30" : "hover:bg-pitch-border"
        }`}
      >
        &larr;
      </Link>
      <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
        GW{gw}
      </span>
      <Link
        href={gw < lastGw ? `${basePath}?gw=${gw + 1}` : "#"}
        aria-disabled={gw >= lastGw}
        className={`rounded bg-pitch-surface2 px-2.5 py-1 font-display text-sm font-bold ${
          gw >= lastGw ? "pointer-events-none opacity-30" : "hover:bg-pitch-border"
        }`}
      >
        &rarr;
      </Link>
      {gw !== liveGw && (
        <Link
          href={basePath}
          className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-gold hover:underline"
        >
          This week
        </Link>
      )}
    </div>
  );
}

export default async function MatchupsPage({
  searchParams,
  basePath = "/matchups",
  shared = false,
}) {
  const params = await searchParams;
  const gwParam = Number(params?.gw);
  const data = await getMatchups(Number.isInteger(gwParam) ? gwParam : undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <RefreshOnFocus />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Matchups
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">{data.leagueName}</p>
        </div>
        <GwNav
          gw={data.currentGw}
          firstGw={data.firstGw}
          lastGw={data.lastGw}
          liveGw={data.liveGw}
          basePath={basePath}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.matches.map((match, i) => (
          <MatchCard
            key={i}
            match={match}
            gw={data.currentGw}
            basePath={basePath}
            shared={shared}
            isPast={data.isPast}
            fixtureStatus={data.fixtureStatus}
          />
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
