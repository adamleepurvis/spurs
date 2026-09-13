import { getSeasonRankings } from "@/lib/fpl-draft";

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];
const POSITION_LABEL = {
  GKP: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

function OwnerBadge({ p }) {
  if (p.isMine) {
    return (
      <span className="rounded bg-gold px-1 py-px text-[9.5px] font-bold text-pitch-bg">
        YOU
      </span>
    );
  }
  if (p.ownerTeamName) {
    return (
      <span className="max-w-[7rem] truncate rounded bg-pitch-surface2 px-1 py-px text-[9.5px] font-semibold text-ink-dim">
        {p.ownerTeamName}
      </span>
    );
  }
  return (
    <span className="rounded bg-positive/20 px-1 py-px text-[9.5px] font-bold text-positive">
      FA
    </span>
  );
}

function RankingRow({ p }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-pitch-border last:border-b-0">
      <span className="min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.team}
      </span>
      <span className="min-w-0 flex-1 text-[13.5px] font-medium">
        {p.name} <OwnerBadge p={p} />
        <span className="ml-1.5 block text-[10px] text-ink-dim">
          £{p.price.toFixed(1)}m
        </span>
      </span>
      <span className="min-w-20 text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          {p.rosPoints.toFixed(1)}
        </span>
        <span className="block text-[10px] text-ink-dim">
          {p.nextGwPoints != null ? p.nextGwPoints.toFixed(1) : "—"} next
        </span>
      </span>
    </div>
  );
}

export default async function RankingsPage() {
  const data = await getSeasonRankings();
  const lastUpdated = new Date(data.lastUpdated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const gwRangeLabel =
    data.windowGws.length > 1
      ? `GW${data.windowGws[0]}–${data.windowGws[data.windowGws.length - 1]}`
      : `GW${data.nextGw}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Season Rankings
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Top 25 per position, ranked by {gwRangeLabel} projected total
          </p>
        </div>
        <span className="text-right text-[11px] text-ink-dim">
          Updated {lastUpdated}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {POSITION_ORDER.map((pos) => (
          <section
            key={pos}
            className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg"
          >
            <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                {POSITION_LABEL[pos]}
              </h2>
              <span className="text-xs text-ink-dim">ROS &middot; next GW</span>
            </div>
            {data.byPosition[pos].map((p) => (
              <RankingRow key={p.id} p={p} />
            ))}
          </section>
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        Projections from FPL Copilot (fplcopilot.com), a third-party model
        &middot; refreshed on every page load
      </footer>
    </div>
  );
}
