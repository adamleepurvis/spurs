# FPL Draft VORP Tracker

A single-page React + Tailwind app for tracking a live Fantasy Premier
League snake draft and ranking undrafted players by **VORP** (Value Over
Replacement Player), recalculated reactively as picks happen.

All state is in-memory only — refreshing the page resets the draft.
There is no backend.

## Running it

```bash
cd fpl-draft-tracker
npm install
npm run dev
```

Then open the printed local URL (defaults to http://localhost:5173).

## ⚠️ Placeholder data

`src/data/players.js` was written entirely by an LLM from general
knowledge — it was **not** pulled from any live stats feed, API, or
official FPL data. Both the player pool (name/team/position) and the
`points` field (projected season fantasy points) are placeholders, and
the pool can be stale by however long it's been since the model's
knowledge cutoff (e.g. it listed Mohamed Salah at Liverpool after he'd
actually left for Trabzonspor). The app shows an in-app warning to the
same effect. Before using this for a real draft:

- Verify the squad list against a current source (e.g. the official FPL
  site) and fix any transfers/retirements — either by editing the data
  file directly, or removing/renaming players in the running app.
- Replace `points` with real projections, either by editing the data
  file or using the inline "click to edit" points override in the
  player table.

## How VORP is calculated

For each position (GK/DEF/MID/FWD):

1. Take all currently **undrafted** players at that position, sorted by
   projected points descending.
2. **Replacement level** = the points of the Nth player in that list,
   where N is the position's configurable "replacement rank" (defaults:
   GK 10, DEF 35, MID 35, FWD 20 — tuned for a 9-team snake draft with
   roster requirements of 2 GK / 5 DEF / 5 MID / 3 FWD).
3. Every undrafted player's **VORP** = their projected points −
   replacement level for their position.

Whenever a player is drafted, the undrafted pool shrinks, replacement
level is recomputed from the new pool, and every remaining player's VORP
(and rank) updates immediately — this is the core reactive behavior the
app is built around. See `src/lib/vorp.js`.

League settings (number of teams, roster requirements, replacement rank
per position) are all editable from the Settings modal.

## Features

- Sortable/filterable undrafted player table (default sort: VORP desc)
- Position filter tabs with live "startable remaining" scarcity badges
- Snake draft order auto-advances the "drafting for" team, with manual
  override
- Per-team roster sidebar showing positions filled vs. still needed
- Undo last pick
- Highlight your own team (★ button on a team card)
- Draft-run tracker (flags 3+ consecutive picks at the same position)
- Inline-editable projected points per player, feeding straight back
  into VORP
