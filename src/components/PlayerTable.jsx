import { useState } from 'react'
import { POSITION_COLORS } from '../lib/constants'

function SortHeader({ label, sortKeyName, sortKey, sortDir, onSort, className = '' }) {
  const active = sortKey === sortKeyName
  return (
    <th
      className={`select-none cursor-pointer px-3 py-2 text-left text-[11px] font-display font-medium uppercase tracking-wider text-ink-dim hover:text-ink ${className}`}
      onClick={() => onSort(sortKeyName)}
    >
      {label}
      {active && <span className="ml-1 text-accent">{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  )
}

function EditablePoints({ player, overrides, setOverride }) {
  const [editing, setEditing] = useState(false)
  const hasOverride = overrides[player.id] !== undefined && overrides[player.id] !== ''

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        defaultValue={player.effPoints}
        className="w-20 bg-pitch-surface2 border border-accent rounded px-1.5 py-0.5 text-sm font-mono"
        onBlur={(e) => {
          setOverride(player.id, e.target.value)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to override projected points"
      className={`px-1.5 py-0.5 rounded hover:bg-pitch-surface2 font-mono ${hasOverride ? 'text-gold font-semibold' : ''}`}
    >
      {player.effPoints}
      {hasOverride && <span className="ml-1 text-[10px] font-body text-gold/80">edited</span>}
    </button>
  )
}

export default function PlayerTable({
  rows,
  search,
  setSearch,
  sortKey,
  sortDir,
  onSort,
  onDraft,
  overrides,
  setOverride,
  selectedTeamName,
  selectedTeamCounts,
  rosterReq,
  onOpenAddPlayer,
}) {
  return (
    <div className="rounded-lg border border-pitch-border bg-pitch-surface/60 flex-1 flex flex-col min-h-0">
      <div className="p-3 border-b border-pitch-border flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player or team..."
          className="flex-1 bg-pitch-surface2 border border-pitch-border rounded px-3 py-1.5 text-sm placeholder:text-ink-dim"
        />
        <span className="font-mono text-xs text-ink-dim whitespace-nowrap">
          {rows.length} undrafted shown
        </span>
        <button
          onClick={onOpenAddPlayer}
          title="Add a placeholder player not in the pool"
          className="text-xs px-2.5 py-1.5 rounded border border-pitch-border bg-pitch-surface2 hover:border-accent/60 font-medium whitespace-nowrap transition-colors"
        >
          + Add Player
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-pitch-surface z-10">
            <tr className="border-b border-pitch-border">
              <SortHeader label="Rank" sortKeyName="rank" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Name" sortKeyName="name" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Team" sortKeyName="team" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Pos" sortKeyName="pos" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Proj Pts" sortKeyName="effPoints" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="VORP" sortKeyName="vorp" {...{ sortKey, sortDir, onSort }} />
              <th className="px-3 py-2 text-left text-[11px] font-display font-medium uppercase tracking-wider text-ink-dim">
                Draft
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((player) => {
              const posFull = (selectedTeamCounts[player.pos] || 0) >= rosterReq[player.pos]
              return (
                <tr key={player.id} className="border-b border-pitch-border/60 hover:bg-pitch-surface2/60">
                  <td className="px-3 py-1.5 font-mono text-ink-dim">{player.rank}</td>
                  <td className="px-3 py-1.5 font-medium">
                    {player.name}
                    {player.projected && (
                      <span
                        className="ml-1.5 align-middle text-[9px] font-mono font-normal text-positive border border-positive/40 rounded px-1 py-0.5"
                        title="Season-long points projection from a real draft-projections source (DraftFantasy), not last season's history"
                      >
                        XP
                      </span>
                    )}
                    {player.estimated && (
                      <span
                        className="ml-1.5 align-middle text-[9px] font-mono font-normal text-ink-dim border border-pitch-border rounded px-1 py-0.5"
                        title="No 2025-26 Premier League history (promoted club or new signing) — points is a price-based estimate, not real history"
                      >
                        EST
                      </span>
                    )}
                    {player.custom && (
                      <span
                        className="ml-1.5 align-middle text-[9px] font-mono font-normal text-accent border border-accent/40 rounded px-1 py-0.5"
                        title="Manually added — not part of the seeded pool"
                      >
                        CUSTOM
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-ink-dim">{player.team}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`text-xs border rounded px-1.5 py-0.5 ${POSITION_COLORS[player.pos]}`}
                    >
                      {player.pos}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <EditablePoints player={player} overrides={overrides} setOverride={setOverride} />
                  </td>
                  <td
                    className={`px-3 py-1.5 font-mono font-semibold ${
                      player.vorp > 0 ? 'text-positive' : player.vorp < 0 ? 'text-ink-dim' : ''
                    }`}
                  >
                    {player.vorp > 0 ? '+' : ''}
                    {player.vorp.toFixed(1)}
                  </td>
                  <td className="px-3 py-1.5">
                    <button
                      onClick={() => onDraft(player.id)}
                      disabled={posFull}
                      title={posFull ? `${selectedTeamName} has no ${player.pos} slots left` : `Draft to ${selectedTeamName}`}
                      className="text-xs px-2.5 py-1 rounded bg-accent hover:bg-accent/85 disabled:bg-pitch-surface2 disabled:text-ink-dim disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Draft
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-ink-dim">
                  <div className="flex flex-col items-center gap-2">
                    <span>No undrafted players match this filter.</span>
                    <button
                      onClick={onOpenAddPlayer}
                      className="text-xs px-2.5 py-1.5 rounded border border-pitch-border bg-pitch-surface2 hover:border-accent/60 font-medium transition-colors"
                    >
                      {search.trim() ? `+ Add "${search.trim()}" as a placeholder player` : '+ Add Player'}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
