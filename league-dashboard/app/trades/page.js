import { getTradeTargets } from "@/lib/fpl-draft";

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];
const POSITION_LABEL = {
  GKP: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

function TargetRow({ c }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 border-b border-pitch-border last:border-b-0">
      <span className="mt-0.5 min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {c.team}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium">{c.name}</span>
        <span className="block text-[10.5px] text-ink-dim">
          Benched at {c.ownerTeamName}
        </span>
        <span className="block text-[10.5px] text-positive">
          +{c.delta.toFixed(1)} over your {c.replacesName} ({c.replacesRos.toFixed(1)})
        </span>
        {c.theirWeakPos && (
          <span className="block text-[10.5px] text-accent">
            They&rsquo;re weak at {c.theirWeakPos} ({c.theirWeakName}
            {c.theirWeakRos != null ? `, ${c.theirWeakRos.toFixed(1)}` : ""})
            {c.suggestedOffer ? ` — try offering ${c.suggestedOffer}` : ""}
          </span>
        )}
      </span>
      <span className="mt-0.5 min-w-14 text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          {c.rosPoints.toFixed(1)}
        </span>
        <span className="block text-[10px] text-ink-dim">ROS</span>
      </span>
    </div>
  );
}

export default async function TradesPage() {
  const data = await getTradeTargets();
  const hasAny = POSITION_ORDER.some((pos) => data.byPosition[pos].length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Trade Targets
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Other teams&rsquo; bench players who&rsquo;d upgrade one of your starters
          </p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
        </span>
      </div>

      {!data.myHasLineup && (
        <p className="mb-6 rounded-md border border-pitch-border bg-pitch-surface2 px-4 py-3 text-xs text-ink-dim">
          Your own GW{data.currentGw} lineup order isn&rsquo;t published yet, so
          starters vs. bench couldn&rsquo;t be determined for your team this week.
        </p>
      )}

      {hasAny ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {POSITION_ORDER.map((pos) => {
            const rows = data.byPosition[pos];
            if (!rows.length) return null;
            return (
              <section
                key={pos}
                className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg"
              >
                <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
                  <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                    {POSITION_LABEL[pos]}
                  </h2>
                  <span className="text-xs text-ink-dim">upgrade &middot; ROS</span>
                </div>
                {rows.map((c, i) => (
                  <TargetRow key={`${pos}-${i}`} c={c} />
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-pitch-border bg-pitch-surface px-5 py-8 text-center text-sm text-ink-dim">
          No clear upgrades sitting on anyone&rsquo;s bench this week &mdash; your
          starters already beat what&rsquo;s available in trades.
        </p>
      )}

      {data.skippedTeams > 0 && (
        <p className="mt-6 text-center text-[11px] text-ink-dim">
          {data.skippedTeams} team{data.skippedTeams === 1 ? "" : "s"} excluded &mdash;
          their GW{data.currentGw} lineup order isn&rsquo;t published yet.
        </p>
      )}

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        ROS projections from FPL Copilot (fplcopilot.com) &middot; refreshed on
        every page load
      </footer>
    </div>
  );
}
