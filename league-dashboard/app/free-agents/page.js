import { getFreeAgents } from "@/lib/fpl-draft";

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];
const POSITION_LABEL = {
  GKP: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

function AgentRow({ p }) {
  const flagged = p.status !== "a" || p.news;
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-pitch-border last:border-b-0">
      <span className="min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.team}
      </span>
      <span className="min-w-0 flex-1 text-[13.5px] font-medium">
        {p.name}
        {flagged && (
          <span
            title={p.news || "Doubtful"}
            className="ml-1.5 inline-block h-[7px] w-[7px] rounded-full bg-danger align-middle"
          />
        )}
      </span>
      <span className="min-w-16 text-right font-mono">
        <span className="block text-sm font-semibold text-gold">
          {p.epNext != null ? p.epNext.toFixed(1) : "—"}
        </span>
        <span className="block text-[10px] text-ink-dim">
          {p.totalPoints} tot
        </span>
      </span>
    </div>
  );
}

export default async function FreeAgentsPage() {
  const data = await getFreeAgents();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Free Agents
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Top 20 per position, ranked by next-gameweek projection
          </p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
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
              <span className="text-xs text-ink-dim">ep_next &middot; total</span>
            </div>
            {data.byPosition[pos].map((p) => (
              <AgentRow key={p.id} p={p} />
            ))}
          </section>
        ))}
      </div>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        ep_next sourced from the classic FPL API (the draft API doesn&rsquo;t
        compute it) &middot; refreshed on every page load
      </footer>
    </div>
  );
}
