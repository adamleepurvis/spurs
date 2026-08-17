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
    <div className="border-b border-pitch-border bg-pitch-surface/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
          <span className="w-2 h-6 bg-accent rounded-sm" aria-hidden="true" />
          <span className="font-display text-xl font-semibold tracking-wide uppercase">
            Draft Room
          </span>
        </div>

        {draftComplete ? (
          <span className="font-mono text-sm font-medium text-positive bg-positive/10 border border-positive/30 rounded px-3 py-1">
            Draft complete
          </span>
        ) : (
          <span className="font-mono text-sm font-medium text-ink bg-pitch-surface2 border border-pitch-border rounded px-3 py-1">
            RD {currentRound} &middot; PICK {currentPickNumber}
            <span className="text-accent font-body font-normal">
              {' '}
              &mdash; on the clock: {teamNames[onClockTeamIndex]}
            </span>
            {onClockTeamIndex === myTeamIndex && (
              <span className="ml-1 text-gold font-semibold">(you!)</span>
            )}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-ink-dim uppercase tracking-wide">Drafting for</label>
          <select
            className="bg-pitch-surface2 border border-pitch-border rounded px-2 py-1 text-sm"
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
            className="text-sm px-3 py-1.5 rounded border border-pitch-border bg-pitch-surface2 hover:border-accent/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Undo last pick
          </button>

          <button
            onClick={onOpenSettings}
            className="text-sm px-3 py-1.5 rounded border border-pitch-border bg-pitch-surface2 hover:border-accent/60 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
