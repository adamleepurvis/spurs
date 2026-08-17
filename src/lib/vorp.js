// Core VORP (Value Over Replacement Player) logic.
//
// Replacement level at a position = the projected points of the Nth-best
// remaining UNDRAFTED player at that position, where N is a configurable
// "replacement rank" per position (roughly: the last player league-wide
// who'd still be a starter). Every time a player is drafted, the
// undrafted pool shrinks, so replacement level is recomputed from
// scratch and every remaining player's VORP shifts.

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']

export function getEffectivePoints(player, overrides) {
  const override = overrides[player.id]
  return override === undefined || override === '' || Number.isNaN(Number(override))
    ? player.points
    : Number(override)
}

// Returns { levels: {GK,DEF,MID,FWD}, poolSize: {...} }
// `levels[pos]` is null when there are zero undrafted players left at pos.
export function computeReplacementLevels(undraftedByPos, replacementRank) {
  const levels = {}
  const poolSize = {}
  for (const pos of POSITIONS) {
    const pool = undraftedByPos[pos] || []
    poolSize[pos] = pool.length
    if (pool.length === 0) {
      levels[pos] = null
      continue
    }
    const n = Math.max(1, replacementRank[pos] || 1)
    const idx = Math.min(n, pool.length) - 1
    levels[pos] = pool[idx].effPoints
  }
  return { levels, poolSize }
}

// Full reactive recompute: given all players, the set of drafted player
// ids, per-player point overrides, and replacement-rank settings,
// returns the undrafted board sorted by VORP desc (with live rank),
// plus replacement levels and startable-remaining counts per position.
export function computeBoard(allPlayers, draftedIds, overrides, replacementRank) {
  const undraftedByPos = { GK: [], DEF: [], MID: [], FWD: [] }

  for (const player of allPlayers) {
    if (draftedIds.has(player.id)) continue
    const effPoints = getEffectivePoints(player, overrides)
    undraftedByPos[player.pos].push({ ...player, effPoints })
  }

  for (const pos of POSITIONS) {
    undraftedByPos[pos].sort((a, b) => b.effPoints - a.effPoints)
  }

  const { levels, poolSize } = computeReplacementLevels(undraftedByPos, replacementRank)

  const board = []
  for (const pos of POSITIONS) {
    const replacement = levels[pos] ?? 0
    for (const player of undraftedByPos[pos]) {
      board.push({ ...player, vorp: player.effPoints - replacement })
    }
  }

  board.sort((a, b) => b.vorp - a.vorp)
  board.forEach((player, i) => {
    player.rank = i + 1
  })

  const startableRemaining = {}
  for (const pos of POSITIONS) {
    const n = Math.max(1, replacementRank[pos] || 1)
    startableRemaining[pos] = Math.min(n, poolSize[pos])
  }

  return { board, levels, poolSize, startableRemaining }
}
