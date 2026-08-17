import { POSITIONS } from '../lib/constants'

const SCARCITY_WARN_THRESHOLD = 6

export default function PositionTabs({ posFilter, setPosFilter, startableRemaining, levels, replacementRank }) {
  const tabs = ['ALL', ...POSITIONS]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = posFilter === tab
        const remaining = tab === 'ALL' ? null : startableRemaining[tab]
        const scarce = remaining !== null && remaining <= SCARCITY_WARN_THRESHOLD
        return (
          <button
            key={tab}
            onClick={() => setPosFilter(tab)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-display uppercase tracking-wide border transition-colors ${
              active
                ? 'bg-accent/15 border-accent text-ink'
                : 'bg-pitch-surface border-pitch-border text-ink-dim hover:border-accent/50'
            }`}
          >
            {tab}
            {remaining !== null && (
              <span
                className={`font-mono normal-case tracking-normal text-[11px] rounded px-1.5 py-0.5 leading-none ${
                  scarce
                    ? 'bg-danger/20 text-danger border border-danger/40'
                    : 'bg-pitch-surface2 text-ink-dim'
                }`}
                title={`Replacement level: ${levels[tab] ?? '—'} pts (rank ${replacementRank[tab]})`}
              >
                {remaining} left
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
