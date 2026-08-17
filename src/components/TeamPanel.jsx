import { useState } from 'react'
import { POSITIONS, POSITION_COLORS } from '../lib/constants'

function TeamCard({
  index,
  name,
  roster,
  counts,
  rosterReq,
  isMine,
  isOnClock,
  setMyTeamIndex,
  renameTeam,
}) {
  const [editingName, setEditingName] = useState(false)
  const totalNeeded = Object.values(rosterReq).reduce((a, b) => a + b, 0)
  const totalFilled = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div
      className={`rounded-lg border p-3 ${
        isMine
          ? 'border-amber-400/60 bg-amber-500/5'
          : isOnClock
          ? 'border-indigo-400/60 bg-indigo-500/5'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {editingName ? (
          <input
            autoFocus
            defaultValue={name}
            className="bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-sm w-full"
            onBlur={(e) => {
              renameTeam(index, e.target.value || name)
              setEditingName(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        ) : (
          <button
            className="font-semibold text-sm truncate hover:underline text-left"
            onClick={() => setEditingName(true)}
            title="Click to rename"
          >
            {name}
          </button>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {isOnClock && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full px-1.5 py-0.5">
              on clock
            </span>
          )}
          <button
            onClick={() => setMyTeamIndex(index)}
            title="Mark as my team"
            className={`text-xs ${isMine ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300'}`}
          >
            ★
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 mb-2">
        {totalFilled}/{totalNeeded} filled
      </div>

      <div className="grid grid-cols-4 gap-1 mb-2">
        {POSITIONS.map((pos) => {
          const filled = counts[pos] || 0
          const need = rosterReq[pos]
          const done = filled >= need
          return (
            <div
              key={pos}
              className={`text-center rounded border px-1 py-0.5 text-[11px] ${
                done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 text-slate-300'
              }`}
              title={`${pos}: ${filled}/${need}`}
            >
              {pos} {filled}/{need}
            </div>
          )
        })}
      </div>

      {roster.length > 0 && (
        <ul className="space-y-1 max-h-40 overflow-auto pr-1">
          {roster
            .slice()
            .sort((a, b) => a.pickNumber - b.pickNumber)
            .map((p) => (
              <li key={p.id} className="flex items-center gap-1.5 text-xs">
                <span className={`border rounded px-1 py-0 text-[10px] ${POSITION_COLORS[p.pos]}`}>
                  {p.pos}
                </span>
                <span className="truncate">{p.name}</span>
                <span className="text-slate-500 ml-auto shrink-0">#{p.pickNumber}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function TeamPanel({
  teamNames,
  rostersByTeam,
  rosterCounts,
  rosterReq,
  myTeamIndex,
  setMyTeamIndex,
  onClockTeamIndex,
  renameTeam,
}) {
  return (
    <div className="lg:w-80 shrink-0 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        Teams
      </h2>
      <div className="flex flex-col gap-3 max-h-[calc(100vh-9rem)] overflow-auto pr-1">
        {teamNames.map((name, i) => (
          <TeamCard
            key={i}
            index={i}
            name={name}
            roster={rostersByTeam[i]}
            counts={rosterCounts[i]}
            rosterReq={rosterReq}
            isMine={i === myTeamIndex}
            isOnClock={i === onClockTeamIndex}
            setMyTeamIndex={setMyTeamIndex}
            renameTeam={renameTeam}
          />
        ))}
      </div>
    </div>
  )
}
