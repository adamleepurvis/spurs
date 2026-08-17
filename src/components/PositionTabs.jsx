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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${
              active
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {tab}
            {remaining !== null && (
              <span
                className={`text-[11px] rounded-full px-1.5 py-0.5 leading-none ${
                  scarce
                    ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                    : 'bg-slate-700/60 text-slate-300'
                }`}
                title={`Replacement level: ${levels[tab] ?? '—'} pts (rank ${replacementRank[tab]})`}
              >
                {remaining} startable left
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
