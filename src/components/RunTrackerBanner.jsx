import { POSITION_COLORS } from '../lib/constants'

function detectRun(recentPicks) {
  if (recentPicks.length < 3) return null
  const last = recentPicks[recentPicks.length - 1]
  let streak = 0
  for (let i = recentPicks.length - 1; i >= 0; i--) {
    if (recentPicks[i].pos === last.pos) streak++
    else break
  }
  return streak >= 3 ? { pos: last.pos, streak } : null
}

export default function RunTrackerBanner({ recentPicks }) {
  const run = detectRun(recentPicks)
  if (!run) return null

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 pt-3">
      <div className="rounded-lg border border-danger/40 bg-danger/10 text-sm px-3 py-2 flex items-center gap-3">
        <div className="flex gap-0.5 shrink-0" aria-hidden="true">
          {Array.from({ length: run.streak }).map((_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-4 rounded-sm border ${POSITION_COLORS[run.pos]}`}
            />
          ))}
        </div>
        <span className="text-ink">
          <strong className="font-display uppercase tracking-wide text-danger">
            {run.pos} run
          </strong>{' '}
          &mdash; {run.streak} straight picks at {run.pos}. Positional scarcity may be shifting fast.
        </span>
      </div>
    </div>
  )
}
