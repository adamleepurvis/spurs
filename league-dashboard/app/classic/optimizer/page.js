import { getClassicRosterOptimizer } from "@/lib/fpl-classic";

function fmt(n) {
  return n != null ? n.toFixed(1) : "—";
}

function MoveRow({ m }) {
  const costLabel =
    m.costDelta > 0.05
      ? `+£${m.costDelta.toFixed(1)}m`
      : m.costDelta < -0.05
        ? `-£${Math.abs(m.costDelta).toFixed(1)}m`
        : "£0.0m";
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
          <span className="text-danger">Sell</span>{" "}
          <span className="font-medium">{m.out.name}</span>
          <span className="text-ink-dim">
            {" "}
            (£{m.out.cost.toFixed(1)}m &middot; {fmt(m.out.epNext)} next &middot;{" "}
            {fmt(m.out.rosPoints)} ROS)
          </span>
        </span>
        <span className="block text-[13px]">
          <span className="text-positive">Buy</span>{" "}
          <span className="font-medium">{m.in.name}</span>{" "}
          <span className="text-ink-dim">({m.in.team})</span>
          <span className="text-ink-dim">
            {" "}
            (£{m.in.cost.toFixed(1)}m &middot; {fmt(m.in.epNext)} next &middot;{" "}
            {fmt(m.in.rosPoints)} ROS)
          </span>
        </span>
      </span>
      <span className="shrink-0 text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          +{m.gain.toFixed(1)}
        </span>
        <span className="block text-[10px] text-ink-dim">{costLabel}</span>
      </span>
    </div>
  );
}

export default async function ClassicOptimizerPage() {
  const data = await getClassicRosterOptimizer();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Roster Optimizer
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Best transfers, ranked by rest-of-season gain &mdash; row N is your
            plan for exactly N transfers
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
            GW{data.currentGw}
          </span>
          <span className="mt-1 block text-[11px] text-ink-dim">
            £{data.bank.toFixed(1)}m in the bank
          </span>
        </div>
      </div>

      {data.moves.length > 0 ? (
        <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
          <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Ranked moves
            </h2>
            <span className="text-xs text-ink-dim">gain &middot; cost change</span>
          </div>
          {data.moves.map((m) => (
            <MoveRow key={`${m.pos}-${m.rank}`} m={m} />
          ))}
        </section>
      ) : (
        <p className="rounded-md border border-pitch-border bg-pitch-surface px-5 py-8 text-center text-sm text-ink-dim">
          No affordable transfer currently beats what&rsquo;s already on your
          roster.
        </p>
      )}

      <footer className="mt-8 space-y-1 text-center text-[11.5px] text-ink-dim">
        <p>
          Sale price is approximated as current market price, and each row&rsquo;s
          budget is figured independently &mdash; pooling proceeds from several
          sales for one bigger upgrade isn&rsquo;t modeled.
        </p>
        <p>
          A transfer beyond your free ones costs &minus;4 points, not reflected
          in the gain above.
        </p>
        <p>ROS from FPL Copilot &middot; refreshed on every page load</p>
      </footer>
    </div>
  );
}
