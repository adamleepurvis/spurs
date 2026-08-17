import { POSITIONS } from '../lib/constants'

function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-right"
      />
    </label>
  )
}

export default function SettingsModal({
  numTeams,
  setNumTeams,
  rosterReq,
  setRosterReq,
  replacementRank,
  setReplacementRank,
  onClose,
}) {
  const totalRoster = Object.values(rosterReq).reduce((a, b) => a + b, 0)

  return (
    <div
      className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-5 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">League Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <div>
          <NumberField label="Number of teams" value={numTeams} onChange={setNumTeams} min={2} />
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Roster requirements per team (total: {totalRoster})
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {POSITIONS.map((pos) => (
              <NumberField
                key={pos}
                label={pos}
                value={rosterReq[pos]}
                onChange={(v) => setRosterReq((prev) => ({ ...prev, [pos]: v }))}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Replacement rank (N) per position
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            Replacement level = points of the Nth-best remaining undrafted player at that
            position. Roughly numTeams &times; typical starters used at that position &mdash;
            defaults are tuned for a 9-team snake draft.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {POSITIONS.map((pos) => (
              <NumberField
                key={pos}
                label={pos}
                value={replacementRank[pos]}
                onChange={(v) => setReplacementRank((prev) => ({ ...prev, [pos]: v }))}
                min={1}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded py-2 text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  )
}
