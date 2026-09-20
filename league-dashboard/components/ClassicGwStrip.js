export default function ClassicGwStrip({ gw, summary }) {
  if (!summary) return null;
  const { points, expectedTotal, projected, remaining } = summary;

  return (
    <div className="mb-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-pitch-border bg-pitch-border shadow-lg">
      {[
        [`GW${gw} xPts (pregame)`, expectedTotal.toFixed(1), ""],
        [`GW${gw} points`, points, "text-ink"],
        [
          `GW${gw} projected`,
          projected.toFixed(1),
          "text-gold",
          `${remaining.count} still to play`,
        ],
      ].map(([label, value, tone, sub]) => (
        <div key={label} className="bg-pitch-surface px-4 py-3.5">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-dim">{label}</div>
          <div className={`font-display text-2xl font-bold leading-none ${tone}`}>{value}</div>
          {sub && <div className="mt-1 text-[10.5px] text-ink-dim">{sub}</div>}
        </div>
      ))}
    </div>
  );
}
