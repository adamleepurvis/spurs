import { getDraftDashboard } from "@/lib/fpl-draft";

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];
const POSITION_LABEL = {
  GKP: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

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

export default async function Page() {
  const data = await getDraftDashboard();

  const starters = data.hasLineupOrder
    ? data.roster.filter((p) => p.positionSlot <= 11)
    : data.roster;
  const bench = data.hasLineupOrder
    ? data.roster.filter((p) => p.positionSlot > 11)
    : [];

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
            <span className="text-xs text-ink-dim">W &ndash; D &ndash; L</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["#", "Team", "Record", "PF", "PA", "Pts"].map((h, i) => (
                    <th
                      key={h}
                      className={`whitespace-nowrap border-b border-pitch-border px-2.5 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-dim ${
                        i >= 3 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
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
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5">
                        <span className="font-semibold">{s.teamName}</span>
                        <span className="block text-[11px] text-ink-dim">
                          {s.manager}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right">
                        <FormPips won={s.won} drawn={s.drawn} lost={s.lost} />
                      </td>
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right font-mono">
                        {s.pointsFor}
                      </td>
                      <td className="whitespace-nowrap border-b border-pitch-border px-2.5 py-2.5 text-right font-mono">
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
          {!data.hasLineupOrder && (
            <p className="border-t border-pitch-border px-4 py-3 text-xs text-ink-dim">
              GW{data.currentGw} lineup order isn&rsquo;t published yet — showing full squad, unordered.
            </p>
          )}
        </section>
      </div>

      <footer className="mt-6 text-center text-[11.5px] text-ink-dim">
        draft.premierleague.com public API &middot; refreshed on every page load
      </footer>
    </div>
  );
}
