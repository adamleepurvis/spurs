import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassicTeamRoster } from "@/lib/fpl-classic";
import ClassicGwStrip from "@/components/ClassicGwStrip";
import ClassicRosterList from "@/components/ClassicRosterList";

export default async function ClassicTeamPage({ params }) {
  const { entryId } = await params;
  const data = await getClassicTeamRoster(Number(entryId));
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <Link
        href="/classic"
        className="mb-4 inline-block text-xs font-semibold uppercase tracking-wide text-ink-dim hover:text-ink"
      >
        &larr; Standings
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(30px,5vw,46px)] font-bold leading-[0.95] tracking-wide">
            {data.teamName}
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">{data.manager} &middot; Classic FPL</p>
        </div>
        <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
          GW{data.currentGw}
        </span>
      </div>

      <ClassicGwStrip gw={data.currentGw} summary={data.gwSummary} />

      <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
        <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
            Squad
          </h2>
          <span className="text-xs text-ink-dim">GW{data.currentGw} points</span>
        </div>
        <ClassicRosterList
          roster={data.roster}
          hasLineupOrder={data.hasLineupOrder}
          currentGw={data.currentGw}
        />
      </section>

      <footer className="mt-8 text-center text-[11.5px] text-ink-dim">
        fantasy.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
