import { getStartSitSuggestions } from "@/lib/fpl-draft";

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];

function SwapRow({ p, tone }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-pitch-border last:border-b-0">
      <span className="min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.team}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium">{p.name}</span>
        {p.opponentTeam && (
          <span className="block text-[10.5px] text-ink-dim">
            vs {p.opponentTeam} ({p.opponentIsHome ? "H" : "A"})
          </span>
        )}
      </span>
      <span
        className={`min-w-12 text-right font-mono text-sm font-semibold ${
          tone === "positive" ? "text-positive" : "text-danger"
        }`}
      >
        {p.epNext != null ? p.epNext.toFixed(1) : "—"}
      </span>
    </div>
  );
}

function LineupRow({ p }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-pitch-border last:border-b-0">
      <span className="min-w-9 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.team}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium">{p.name}</span>
        {p.opponentTeam && (
          <span className="block text-[10.5px] text-ink-dim">
            vs {p.opponentTeam} ({p.opponentIsHome ? "H" : "A"})
          </span>
        )}
      </span>
      <span className="min-w-10 rounded bg-pitch-surface2 px-1.5 py-0.5 text-center font-mono text-[10.5px] text-ink-dim">
        {p.pos}
      </span>
      <span className="min-w-12 text-right font-mono text-sm font-semibold text-gold">
        {p.epNext != null ? p.epNext.toFixed(1) : "—"}
      </span>
    </div>
  );
}

export default async function LineupPage() {
  const data = await getStartSitSuggestions();
  const hasSwaps = data.shouldStart.length > 0 || data.shouldBench.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            Start/Sit
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Your lineup vs. the highest-xPts XI your squad allows
          </p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
        </span>
      </div>

      {!data.hasLineupOrder ? (
        <p className="mb-6 rounded-md border border-pitch-border bg-pitch-surface2 px-4 py-3 text-xs text-ink-dim">
          Your GW{data.currentGw} lineup order isn&rsquo;t published yet, so there&rsquo;s
          nothing to compare against &mdash; here&rsquo;s the highest-xPts XI your
          squad allows for reference.
        </p>
      ) : hasSwaps ? (
        <p className="mb-6 rounded-md border border-gold/50 bg-pitch-surface px-4 py-3 text-sm">
          Your bench is holding back{" "}
          <span className="font-semibold text-gold">{data.gain.toFixed(1)} xPts</span>{" "}
          this week ({data.currentTotal.toFixed(1)} &rarr; {data.optimalTotal.toFixed(1)}).
        </p>
      ) : (
        <p className="mb-6 rounded-md border border-positive/50 bg-pitch-surface px-4 py-3 text-sm text-positive">
          Your lineup is already optimal &mdash; no swaps to suggest this week.
        </p>
      )}

      {hasSwaps && (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
            <div className="border-b border-pitch-border px-4.5 py-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-positive">
                Start these
              </h2>
            </div>
            {data.shouldStart.map((p, i) => (
              <SwapRow key={i} p={p} tone="positive" />
            ))}
          </section>
          <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
            <div className="border-b border-pitch-border px-4.5 py-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-danger">
                Bench these
              </h2>
            </div>
            {data.shouldBench.map((p, i) => (
              <SwapRow key={i} p={p} tone="negative" />
            ))}
          </section>
        </div>
      )}

      <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
        <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Optimal XI
          </h2>
          <span className="text-xs text-ink-dim">
            {data.optimalTotal.toFixed(1)} xPts total
          </span>
        </div>
        {POSITION_ORDER.map((pos) => {
          const players = data.optimalStarters.filter((p) => p.pos === pos);
          if (!players.length) return null;
          return players.map((p, i) => <LineupRow key={`${pos}-${i}`} p={p} />);
        })}
      </section>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        Based on ep_next (classic FPL API) under 1 GK / 3&ndash;5 DEF / 2&ndash;5 MID
        / 1&ndash;3 FWD &middot; refreshed on every page load
      </footer>
    </div>
  );
}
