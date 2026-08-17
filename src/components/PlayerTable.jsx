import { useState } from 'react'
import { POSITION_COLORS } from '../lib/constants'

function SortHeader({ label, sortKeyName, sortKey, sortDir, onSort, className = '' }) {
  const active = sortKey === sortKeyName
  return (
    <th
      className={`select-none cursor-pointer px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200 ${className}`}
      onClick={() => onSort(sortKeyName)}
    >
      {label}
      {active && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
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
        className="w-20 bg-slate-800 border border-indigo-500 rounded px-1.5 py-0.5 text-sm"
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
      className={`px-1.5 py-0.5 rounded hover:bg-slate-800 ${hasOverride ? 'text-amber-300 font-semibold' : ''}`}
    >
      {player.effPoints}
      {hasOverride && <span className="ml-1 text-[10px] text-amber-400">edited</span>}
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
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 flex-1 flex flex-col min-h-0">
      <div className="p-3 border-b border-slate-800 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player or team..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm placeholder:text-slate-500"
        />
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {rows.length} undrafted shown
        </span>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900 z-10">
            <tr className="border-b border-slate-800">
              <SortHeader label="Rank" sortKeyName="rank" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Name" sortKeyName="name" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Team" sortKeyName="team" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Pos" sortKeyName="pos" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="Proj Pts" sortKeyName="effPoints" {...{ sortKey, sortDir, onSort }} />
              <SortHeader label="VORP" sortKeyName="vorp" {...{ sortKey, sortDir, onSort }} />
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Draft
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((player) => {
              const posFull = (selectedTeamCounts[player.pos] || 0) >= rosterReq[player.pos]
              return (
                <tr
                  key={player.id}
                  className="border-b border-slate-800/60 hover:bg-slate-800/40"
                >
                  <td className="px-3 py-1.5 text-slate-400">{player.rank}</td>
                  <td className="px-3 py-1.5 font-medium">{player.name}</td>
                  <td className="px-3 py-1.5 text-slate-400">{player.team}</td>
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
                    className={`px-3 py-1.5 font-semibold ${
                      player.vorp > 0 ? 'text-emerald-400' : player.vorp < 0 ? 'text-slate-500' : ''
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
                      className="text-xs px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed font-medium"
                    >
                      Draft
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  No undrafted players match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
