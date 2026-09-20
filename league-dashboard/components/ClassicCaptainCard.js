function PickRow({ label, pick, current, tone }) {
  if (!pick) return null;
  const changed = current && current.name !== pick.name;
  return (
    <div className="flex items-center gap-3 border-b border-pitch-border px-4 py-3 last:border-b-0">
      <span
        className={`min-w-14 rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider ${tone}`}
      >
        {label}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">
          {pick.name}
          {pick.isBench && (
            <span className="ml-1.5 text-[10.5px] font-normal text-gold">on bench</span>
          )}
        </span>
        <span className="block text-[10.5px] text-ink-dim">
          {pick.team}
          {pick.opponentTeam &&
            ` · vs ${pick.opponentTeam} (${pick.opponentIsHome ? "H" : "A"})`}
          {pick.status !== "a" && (
            <span className="text-danger"> · {pick.news || "fitness doubt"}</span>
          )}
        </span>
      </span>
      <span className="text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          {pick.epNext.toFixed(1)}
        </span>
        <span className="block text-[10px] text-ink-dim">xPts</span>
      </span>
      <span className="min-w-20 text-right text-[10.5px] text-ink-dim">
        {current
          ? changed
            ? `now: ${current.name}`
            : "already set"
          : ""}
      </span>
    </div>
  );
}

export default function ClassicCaptainCard({ gw, picks }) {
  if (!picks?.captain) return null;
  const { locked, captain, vice, currentCaptain, currentVice, gain, alternatives } = picks;

  return (
    <section className="mb-6 overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-pitch-border px-4.5 py-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
          Captain picks
        </h2>
        <span className="text-xs text-ink-dim">
          {locked
            ? `GW${gw} is under way — locked, shown for reference`
            : `Set before the GW${gw} deadline`}
        </span>
      </div>

      {gain > 0 ? (
        <p className="border-b border-pitch-border bg-pitch-surface2 px-4 py-2.5 text-[12.5px]">
          Switching captain from{" "}
          <span className="font-semibold">{currentCaptain?.name}</span> to{" "}
          <span className="font-semibold">{captain.name}</span> is worth about{" "}
          <span className="font-semibold text-gold">+{gain.toFixed(1)} xPts</span>.
        </p>
      ) : (
        <p className="border-b border-pitch-border bg-pitch-surface2 px-4 py-2.5 text-[12.5px] text-positive">
          Your captain is already the top xPts pick.
        </p>
      )}

      <PickRow label="Captain" pick={captain} current={currentCaptain} tone="bg-gold text-pitch-bg" />
      <PickRow label="Vice" pick={vice} current={currentVice} tone="bg-accent-dim text-ink" />

      <div className="border-t border-pitch-border bg-pitch-surface2 px-4 py-2 text-[10.5px] text-ink-dim">
        Next best:{" "}
        {alternatives
          .filter((a) => a.name !== captain.name && a.name !== vice?.name)
          .slice(0, 3)
          .map((a) => `${a.name} ${a.epNext.toFixed(1)}`)
          .join(" · ")}
        {" "}&middot; vice is the best pick from a different club
      </div>
    </section>
  );
}
