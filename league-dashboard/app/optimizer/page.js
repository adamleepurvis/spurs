import { getRosterOptimizer } from "@/lib/fpl-draft";

function fmt(n) {
  return n != null ? n.toFixed(1) : "—";
}

function MoveRow({ m }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-pitch-border last:border-b-0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pitch-surface2 font-mono text-xs font-bold text-ink-dim">
        {m.rank}
      </span>
      <span className="min-w-10 shrink-0 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {m.pos}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px]">
          <span className="text-danger">Drop</span>{" "}
          <span className="font-medium">{m.out.name}</span>
          <span className="text-ink-dim">
            {" "}
            ({fmt(m.out.epNext)} next &middot; {fmt(m.out.rosPoints)} ROS)
          </span>
        </span>
        <span className="block text-[13px]">
          <span className="text-positive">Add</span>{" "}
          <span className="font-medium">{m.in.name}</span>{" "}
          <span className="text-ink-dim">({m.in.team})</span>
          <span className="text-ink-dim">
            {" "}
            ({fmt(m.in.epNext)} next &middot; {fmt(m.in.rosPoints)} ROS)
          </span>
        </span>
      </span>
      <span className="shrink-0 text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          +{m.gain.toFixed(1)}
        </span>
        <span className="block text-[10px] text-ink-dim">
          &Sigma; {m.cumulativeGain.toFixed(1)}
        </span>
      </span>
    </div>
  );
}

export default async function OptimizerPage() {
  const data = await getRosterOptimizer();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Roster Optimizer
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Best waiver swaps, ranked by rest-of-season gain &mdash; row N is your
            optimal plan for exactly N moves
          </p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
        </span>
      </div>

      {data.moves.length > 0 ? (
        <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
          <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Ranked moves
            </h2>
            <span className="text-xs text-ink-dim">gain &middot; cumulative</span>
          </div>
          {data.moves.map((m) => (
            <MoveRow key={`${m.pos}-${m.rank}`} m={m} />
          ))}
        </section>
      ) : (
        <p className="rounded-md border border-pitch-border bg-pitch-surface px-5 py-8 text-center text-sm text-ink-dim">
          No waiver swap currently beats what&rsquo;s already on your roster.
        </p>
      )}

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        ROS from FPL Copilot, next-GW from the classic FPL API &middot; refreshed on
        every page load
      </footer>
    </div>
  );
}
