const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];
const POSITION_LABEL = {
  GKP: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

function PlayerRow({ p }) {
  const flagged = p.status !== "a" || p.news;
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-pitch-border last:border-b-0">
      <span className="min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.team}
      </span>
      <span className="min-w-0 flex-1 text-[13.5px] font-medium">
        {p.name}
        {p.isCaptain && (
          <span className="ml-1.5 rounded bg-gold px-1 py-px text-[9.5px] font-bold text-pitch-bg">
            C
          </span>
        )}
        {p.isViceCaptain && (
          <span className="ml-1.5 rounded bg-accent-dim px-1 py-px text-[9.5px] font-bold text-ink">
            V
          </span>
        )}
        {flagged && (
          <span
            title={p.news || "Fitness concern"}
            className="ml-1.5 inline-block h-[7px] w-[7px] rounded-full bg-danger align-middle"
          />
        )}
      </span>
      <span className="min-w-11 text-right font-mono">
        <span className="block text-sm font-semibold">{p.eventPoints}</span>
        <span className="block text-[10px] text-ink-dim">
          {p.totalPoints} tot
        </span>
      </span>
    </div>
  );
}

export default function RosterList({ roster, hasLineupOrder, currentGw }) {
  const starters = hasLineupOrder
    ? roster.filter((p) => p.positionSlot <= 11)
    : roster;
  const bench = hasLineupOrder ? roster.filter((p) => p.positionSlot > 11) : [];

  return (
    <>
      {POSITION_ORDER.map((pos) => {
        const players = starters.filter((p) => p.pos === pos);
        if (!players.length) return null;
        return (
          <div key={pos} className="border-t border-pitch-border first:border-t-0">
            <div className="bg-pitch-surface2 px-4 py-1.5 text-[10.5px] uppercase tracking-wider text-ink-dim">
              {POSITION_LABEL[pos]}
            </div>
            {players.map((p, i) => (
              <PlayerRow key={`${p.name}-${i}`} p={p} />
            ))}
          </div>
        );
      })}
      {bench.length > 0 && (
        <>
          <div className="border-y border-pitch-border bg-pitch-surface2 px-4 py-1.5 text-[10px] uppercase tracking-widest text-ink-dim">
            Bench
          </div>
          {bench.map((p, i) => (
            <PlayerRow key={`bench-${p.name}-${i}`} p={p} />
          ))}
        </>
      )}
      {!hasLineupOrder && (
        <p className="border-t border-pitch-border px-4 py-3 text-xs text-ink-dim">
          GW{currentGw} lineup order isn&rsquo;t published yet — showing full squad, unordered.
        </p>
      )}
    </>
  );
}
