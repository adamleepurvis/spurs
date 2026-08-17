export default function TopBar({
  currentPickNumber,
  currentRound,
  onClockTeamIndex,
  teamNames,
  myTeamIndex,
  draftComplete,
  selectedTeamIndex,
  setSelectedTeamIndex,
  onUndo,
  canUndo,
  onOpenSettings,
}) {
  return (
    <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-xl font-bold tracking-tight">FPL Draft VORP Tracker</span>
        </div>

        {draftComplete ? (
          <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            Draft complete
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-200 bg-slate-800 rounded-full px-3 py-1">
            Round {currentRound} &middot; Pick {currentPickNumber}
            <span className="text-indigo-300"> &mdash; on the clock: {teamNames[onClockTeamIndex]}</span>
            {onClockTeamIndex === myTeamIndex && (
              <span className="ml-1 text-amber-300 font-semibold">(you!)</span>
            )}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-slate-400">Drafting for</label>
          <select
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
            value={selectedTeamIndex}
            onChange={(e) => setSelectedTeamIndex(Number(e.target.value))}
          >
            {teamNames.map((name, i) => (
              <option key={i} value={i}>
                {name}
                {i === onClockTeamIndex ? ' (on the clock)' : ''}
                {i === myTeamIndex ? ' ★' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="text-sm px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo last pick
          </button>

          <button
            onClick={onOpenSettings}
            className="text-sm px-3 py-1.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
