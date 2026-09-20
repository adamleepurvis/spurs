const BASE = "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider";

export default function MatchStatusBadge({ started, finished, fixtureStatus }) {
  if (finished) {
    return <span className={`${BASE} bg-ink text-pitch-bg`}>Final</span>;
  }
  if (!started) {
    return <span className={`${BASE} bg-pitch-surface2 text-ink-dim`}>Upcoming</span>;
  }
  if (fixtureStatus === "live") {
    return (
      <span className={`${BASE} flex items-center gap-1.5 bg-danger/20 text-danger`}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
        Live
      </span>
    );
  }
  if (fixtureStatus === "fulltime") {
    return (
      <span
        title="All games are over - waiting for FPL to confirm the final score (bonus points and auto-subs)"
        className={`${BASE} bg-gold/20 text-gold`}
      >
        Full time
      </span>
    );
  }
  return <span className={`${BASE} bg-pitch-surface2 text-ink-dim`}>In progress</span>;
}
