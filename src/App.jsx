import { useEffect, useMemo, useState } from 'react'
import { PLAYERS_SEED } from './data/players'
import { computeBoard } from './lib/vorp'
import { pickToTeamIndex, pickToRound, makeDefaultTeamNames, emptyRosterCounts } from './lib/draft'
import {
  POSITIONS,
  DEFAULT_ROSTER_REQ,
  DEFAULT_REPLACEMENT_RANK,
  DEFAULT_NUM_TEAMS,
} from './lib/constants'

import TopBar from './components/TopBar'
import SettingsModal from './components/SettingsModal'
import PositionTabs from './components/PositionTabs'
import PlayerTable from './components/PlayerTable'
import TeamPanel from './components/TeamPanel'
import RunTrackerBanner from './components/RunTrackerBanner'

export default function App() {
  const [numTeams, setNumTeams] = useState(DEFAULT_NUM_TEAMS)
  const [rosterReq, setRosterReq] = useState(DEFAULT_ROSTER_REQ)
  const [replacementRank, setReplacementRank] = useState(DEFAULT_REPLACEMENT_RANK)
  const [teamNames, setTeamNames] = useState(makeDefaultTeamNames(DEFAULT_NUM_TEAMS))
  const [myTeamIndex, setMyTeamIndex] = useState(0)

  const [draftedPicks, setDraftedPicks] = useState([]) // [{pickNumber, playerId, teamIndex, pos}]
  const [overrides, setOverrides] = useState({}) // playerId -> number
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [posFilter, setPosFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('vorp')
  const [sortDir, setSortDir] = useState('desc')

  const currentPickNumber = draftedPicks.length + 1
  const onClockTeamIndex = pickToTeamIndex(currentPickNumber, numTeams)
  const currentRound = pickToRound(currentPickNumber, numTeams)

  const [selectedTeamIndex, setSelectedTeamIndex] = useState(onClockTeamIndex)
  useEffect(() => {
    setSelectedTeamIndex(onClockTeamIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPickNumber, numTeams])

  // Keep team names array in sync with numTeams changes.
  useEffect(() => {
    setTeamNames((prev) => {
      if (prev.length === numTeams) return prev
      const next = makeDefaultTeamNames(numTeams)
      for (let i = 0; i < Math.min(prev.length, numTeams); i++) next[i] = prev[i]
      return next
    })
    setMyTeamIndex((i) => Math.min(i, numTeams - 1))
  }, [numTeams])

  const draftedIds = useMemo(() => new Set(draftedPicks.map((d) => d.playerId)), [draftedPicks])

  const playersById = useMemo(() => {
    const map = new Map()
    for (const p of PLAYERS_SEED) map.set(p.id, p)
    return map
  }, [])

  const { board, levels, startableRemaining } = useMemo(
    () => computeBoard(PLAYERS_SEED, draftedIds, overrides, replacementRank),
    [draftedIds, overrides, replacementRank]
  )

  // Roster counts + drafted player lists per team.
  const rosterCounts = useMemo(() => {
    const counts = Array.from({ length: numTeams }, () => emptyRosterCounts())
    for (const pick of draftedPicks) {
      counts[pick.teamIndex][pick.pos] = (counts[pick.teamIndex][pick.pos] || 0) + 1
    }
    return counts
  }, [draftedPicks, numTeams])

  const rostersByTeam = useMemo(() => {
    const rosters = Array.from({ length: numTeams }, () => [])
    for (const pick of draftedPicks) {
      const player = playersById.get(pick.playerId)
      if (player) rosters[pick.teamIndex].push({ ...player, pickNumber: pick.pickNumber })
    }
    return rosters
  }, [draftedPicks, numTeams, playersById])

  function draftPlayer(playerId) {
    const player = playersById.get(playerId)
    if (!player || draftedIds.has(playerId)) return
    const teamCounts = rosterCounts[selectedTeamIndex] || emptyRosterCounts()
    if ((teamCounts[player.pos] || 0) >= rosterReq[player.pos]) return
    setDraftedPicks((prev) => [
      ...prev,
      { pickNumber: currentPickNumber, playerId, teamIndex: selectedTeamIndex, pos: player.pos },
    ])
  }

  function undoLastPick() {
    setDraftedPicks((prev) => prev.slice(0, -1))
  }

  function setOverride(playerId, value) {
    setOverrides((prev) => ({ ...prev, [playerId]: value }))
  }

  function renameTeam(index, name) {
    setTeamNames((prev) => prev.map((n, i) => (i === index ? name : n)))
  }

  const filteredBoard = useMemo(() => {
    let rows = board
    if (posFilter !== 'ALL') rows = rows.filter((p) => p.pos === posFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      )
    }
    const sorted = [...rows].sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (typeof av === 'string') {
        av = av.toLowerCase()
        bv = bv.toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return sorted
  }, [board, posFilter, search, sortKey, sortDir])

  function onSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const recentPicks = draftedPicks.slice(-6)
  const draftComplete = draftedPicks.length >= numTeams * Object.values(rosterReq).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        currentPickNumber={currentPickNumber}
        currentRound={currentRound}
        onClockTeamName={teamNames[onClockTeamIndex]}
        onClockTeamIndex={onClockTeamIndex}
        myTeamIndex={myTeamIndex}
        draftComplete={draftComplete}
        selectedTeamIndex={selectedTeamIndex}
        setSelectedTeamIndex={setSelectedTeamIndex}
        teamNames={teamNames}
        onUndo={undoLastPick}
        canUndo={draftedPicks.length > 0}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <RunTrackerBanner recentPicks={recentPicks} teamNames={teamNames} />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-[1600px] w-full mx-auto">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs px-3 py-2">
            <strong>Placeholder data:</strong> player pool reflects the 2025-26 PL as best known,
            but projected points are made-up placeholder values, not a real projections model.
            Edit any player&apos;s points inline before using this for a real draft.
          </div>

          <PositionTabs
            posFilter={posFilter}
            setPosFilter={setPosFilter}
            startableRemaining={startableRemaining}
            levels={levels}
            replacementRank={replacementRank}
          />

          <PlayerTable
            rows={filteredBoard}
            search={search}
            setSearch={setSearch}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            onDraft={draftPlayer}
            overrides={overrides}
            setOverride={setOverride}
            selectedTeamName={teamNames[selectedTeamIndex]}
            selectedTeamCounts={rosterCounts[selectedTeamIndex] || emptyRosterCounts()}
            rosterReq={rosterReq}
          />
        </div>

        <TeamPanel
          teamNames={teamNames}
          rostersByTeam={rostersByTeam}
          rosterCounts={rosterCounts}
          rosterReq={rosterReq}
          myTeamIndex={myTeamIndex}
          setMyTeamIndex={setMyTeamIndex}
          onClockTeamIndex={onClockTeamIndex}
          renameTeam={renameTeam}
        />
      </div>

      {settingsOpen && (
        <SettingsModal
          numTeams={numTeams}
          setNumTeams={setNumTeams}
          rosterReq={rosterReq}
          setRosterReq={setRosterReq}
          replacementRank={replacementRank}
          setReplacementRank={setReplacementRank}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
