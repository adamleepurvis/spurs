import { getMatchups } from "@/lib/fpl-draft";

function StatusBadge({ started, finished }) {
  if (finished) {
    return (
      <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pitch-bg">
        Final
      </span>
    );
  }
  if (started) {
    return (
      <span className="flex items-center gap-1.5 rounded bg-danger/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
        Live
      </span>
    );
  }
  return (
    <span className="rounded bg-pitch-surface2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-dim">
      Upcoming
    </span>
  );
}

function TeamSide({ team, points, winning, align }) {
  return (
    <div className={`flex flex-1 flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className={`text-base font-semibold ${winning ? "text-ink" : "text-ink-dim"}`}>
        {team.teamName}
      </span>
      <span className="text-[11px] text-ink-dim">{team.manager}</span>
    </div>
  );
}

function MatchCard({ match }) {
  const { team1, team2, started, finished, involvesMe } = match;
  const team1Winning = started && team1.points > team2.points;
  const team2Winning = started && team2.points > team1.points;

  return (
    <div
      className={`rounded-md border bg-pitch-surface p-5 shadow-lg ${
        involvesMe ? "border-gold/70 shadow-[0_0_0_1px_rgba(242,181,68,0.3)]" : "border-pitch-border"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <StatusBadge started={started} finished={finished} />
        {involvesMe && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
            Your match
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <TeamSide team={team1} points={team1.points} winning={team1Winning} align="left" />
        <div className="flex items-center gap-3 font-mono">
          <span className={`text-3xl font-bold ${team1Winning ? "text-ink" : "text-ink-dim"}`}>
            {started ? team1.points : "–"}
          </span>
          <span className="text-sm text-ink-dim">&ndash;</span>
          <span className={`text-3xl font-bold ${team2Winning ? "text-ink" : "text-ink-dim"}`}>
            {started ? team2.points : "–"}
          </span>
        </div>
        <TeamSide team={team2} points={team2.points} winning={team2Winning} align="right" />
      </div>
    </div>
  );
}

export default async function MatchupsPage() {
  const data = await getMatchups();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Matchups
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">{data.leagueName}</p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.matches.map((match, i) => (
          <MatchCard key={i} match={match} />
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
