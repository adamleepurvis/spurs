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
          ? 'border-gold/60 bg-gold/5'
          : isOnClock
          ? 'border-accent/60 bg-accent/5'
          : 'border-pitch-border bg-pitch-surface/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {editingName ? (
          <input
            autoFocus
            defaultValue={name}
            className="bg-pitch-surface2 border border-pitch-border rounded px-1.5 py-0.5 text-sm w-full font-display"
            onBlur={(e) => {
              renameTeam(index, e.target.value || name)
              setEditingName(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        ) : (
          <button
            className="font-display font-medium tracking-wide text-sm truncate hover:text-accent text-left transition-colors"
            onClick={() => setEditingName(true)}
            title="Click to rename"
          >
            {name}
          </button>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {isOnClock && (
            <span className="font-mono text-[10px] bg-accent/20 text-accent border border-accent/40 rounded px-1.5 py-0.5">
              on clock
            </span>
          )}
          <button
            onClick={() => setMyTeamIndex(index)}
            title="Mark as my team"
            className={`text-xs ${isMine ? 'text-gold' : 'text-pitch-border hover:text-ink-dim'}`}
          >
            ★
          </button>
        </div>
      </div>

      <div className="font-mono text-[11px] text-ink-dim mb-2">
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
              className={`text-center rounded border px-1 py-0.5 font-mono text-[11px] ${
                done ? 'border-positive/40 bg-positive/10 text-positive' : 'border-pitch-border text-ink-dim'
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
                <span className="font-mono text-ink-dim ml-auto shrink-0">#{p.pickNumber}</span>
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
      <h2 className="font-display text-sm font-medium text-ink-dim uppercase tracking-wider">
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
