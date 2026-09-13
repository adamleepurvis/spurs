import { getDraftDashboard } from "@/lib/fpl-draft";
import RosterList from "@/components/RosterList";

function FormPips({ won, drawn, lost }) {
  return (
    <span className="inline-flex gap-[3px] align-middle">
      {Array.from({ length: won }).map((_, i) => (
        <span key={`w${i}`} className="h-2 w-2 rounded-full bg-positive" />
      ))}
      {Array.from({ length: drawn }).map((_, i) => (
        <span key={`d${i}`} className="h-2 w-2 rounded-full bg-ink-dim" />
      ))}
      {Array.from({ length: lost }).map((_, i) => (
        <span key={`l${i}`} className="h-2 w-2 rounded-full bg-danger" />
      ))}
    </span>
  );
}

export default async function Page() {
  const data = await getDraftDashboard();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      {/* Masthead */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-ink pb-5">
        <div>
          <h1 className="font-display text-[clamp(34px,6vw,58px)] font-bold leading-[0.92] tracking-wide">
            {data.myTeamName}
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            {data.leagueName} &middot; Draft league
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="inline-flex items-baseline gap-1.5 rounded bg-ink px-3 py-1 font-display text-[15px] font-bold text-pitch-bg">
            GW{data.currentGw}
          </span>
          {data.nextGwDeadline && (
            <>
              <span className="text-[11px] uppercase tracking-wider text-ink-dim">
                {data.nextGwName} deadline
              </span>
              <span className="font-display text-xl font-bold text-gold">
                {data.nextGwDeadline}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Standings */}
        <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
          <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              Standings
            </h2>
            <span className="hidden text-xs text-ink-dim sm:inline">
              W &ndash; D &ndash; L
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim">
                    #
                  </th>
                  <th className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim">
                    Team
                  </th>
                  <th className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim sm:table-cell">
                    Record
                  </th>
                  <th className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim md:table-cell">
                    PF
                  </th>
                  <th className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim md:table-cell">
                    PA
                  </th>
                  <th className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.standings.map((s) => {
                  const isMe = s.entryId === data.myEntryId;
                  return (
                    <tr
                      key={s.entryId}
                      className={
                        isMe
                          ? "bg-accent-dim/20 shadow-[inset_3px_0_0_var(--color-gold)]"
                          : "hover:bg-pitch-surface2"
                      }
                    >
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 font-mono text-ink-dim">
                        {s.rank}
                      </td>
                      <td className="border-b border-pitch-border px-2.5 py-2.5">
                        <span className="font-semibold">{s.teamName}</span>
                        <span className="block text-[11px] text-ink-dim">
                          {s.manager}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right sm:table-cell">
                        <FormPips won={s.won} drawn={s.drawn} lost={s.lost} />
                      </td>
                      <td className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right font-mono md:table-cell">
                        {s.pointsFor}
                      </td>
                      <td className="hidden whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right font-mono md:table-cell">
                        {s.pointsAgainst}
                      </td>
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right font-mono text-[14.5px] font-bold">
                        {s.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* My squad */}
        <section className="overflow-hidden rounded-md border border-pitch-border bg-pitch-surface shadow-lg">
          <div className="flex items-baseline justify-between border-b border-pitch-border px-4.5 py-4">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              My squad
            </h2>
            <span className="text-xs text-ink-dim">
              GW{data.currentGw} points
            </span>
          </div>
          <RosterList
            roster={data.roster}
            hasLineupOrder={data.hasLineupOrder}
            currentGw={data.currentGw}
          />
        </section>
      </div>

      <footer className="mt-6 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
