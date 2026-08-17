// Snake draft order + roster helpers.

export function pickToTeamIndex(pickNumber, numTeams) {
  // pickNumber is 1-indexed (the 1st overall pick, etc.)
  const i = pickNumber - 1
  const round = Math.floor(i / numTeams)
  const indexInRound = i % numTeams
  return round % 2 === 0 ? indexInRound : numTeams - 1 - indexInRound
}

export function pickToRound(pickNumber, numTeams) {
  return Math.floor((pickNumber - 1) / numTeams) + 1
}

export function totalRosterSlots(rosterReq) {
  return Object.values(rosterReq).reduce((a, b) => a + b, 0)
}

export function emptyRosterCounts() {
  return { GK: 0, DEF: 0, MID: 0, FWD: 0 }
}

export function makeDefaultTeamNames(numTeams) {
  return Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`)
}
