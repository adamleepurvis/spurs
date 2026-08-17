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

export default function RunTrackerBanner({ recentPicks, teamNames }) {
  const run = detectRun(recentPicks)
  if (!run) return null

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 pt-3">
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 text-sm px-3 py-2 flex items-center gap-2">
        <span className="text-lg">🏃</span>
        <span>
          <strong>{run.pos} run!</strong> {run.streak} of the last {run.streak} picks have been{' '}
          {run.pos}. Positional scarcity may be shifting fast.
        </span>
      </div>
    </div>
  )
}
