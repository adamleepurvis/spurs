import { useState } from 'react'
import { POSITIONS } from '../lib/constants'

export default function AddPlayerModal({ initialName = '', onAdd, onClose }) {
  const [name, setName] = useState(initialName)
  const [team, setTeam] = useState('')
  const [pos, setPos] = useState('MID')
  const [points, setPoints] = useState(80)

  const canSubmit = name.trim().length > 0 && team.trim().length > 0

  function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({
      name: name.trim(),
      team: team.trim().toUpperCase().slice(0, 4),
      pos,
      points: Number(points) || 0,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="bg-pitch-surface border border-pitch-border rounded-lg w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Add Player
          </h2>
          <button type="button" onClick={onClose} className="text-ink-dim hover:text-ink">
            ✕
          </button>
        </div>

        <p className="text-[11px] text-ink-dim/80">
          For anyone missing from the pool (a late trade, a name mismatch, someone the seed data
          missed). Points is a plain placeholder you set yourself — draft them like anyone else,
          and they&apos;ll feed into VORP the same way.
        </p>

        <label className="block text-sm">
          <span className="text-ink-dim">Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="mt-1 w-full bg-pitch-surface2 border border-pitch-border rounded px-2 py-1.5"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-ink-dim">Team</span>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g. ARS"
              maxLength={4}
              className="mt-1 w-full bg-pitch-surface2 border border-pitch-border rounded px-2 py-1.5 uppercase"
            />
          </label>

          <label className="block text-sm">
            <span className="text-ink-dim">Position</span>
            <select
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              className="mt-1 w-full bg-pitch-surface2 border border-pitch-border rounded px-2 py-1.5"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-ink-dim">Placeholder points</span>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="mt-1 w-full bg-pitch-surface2 border border-pitch-border rounded px-2 py-1.5 font-mono"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-accent hover:bg-accent/85 disabled:bg-pitch-surface2 disabled:text-ink-dim disabled:cursor-not-allowed rounded py-2 text-sm font-medium transition-colors"
        >
          Add to pool
        </button>
      </form>
    </div>
  )
}
