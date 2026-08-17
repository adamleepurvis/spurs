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

## Data source

`src/data/players.js` was regenerated from the official Fantasy Premier
League API (`bootstrap-static`), fetched by the user on 2026-08-17,
ahead of 2026-27 Gameweek 1 (deadline 2026-08-21). Name/team/position
are real and current as of that fetch. It replaced an earlier
hand-written placeholder pool that turned out to have real gaps — most
notably it still listed Mohamed Salah at Liverpool after he'd actually
left for Trabzonspor.

`points` is each player's **actual total FPL points from the completed
2025-26 season** — real historical data, used as a starting-point
baseline, not a real projections model (no adjustment for age, new-club
fit, tactical change, etc). Entries with essentially no 2025-26 Premier
League history (promoted-club squads, players newly arrived in the
league) have `estimated: true` and are badged `EST` in the app — their
`points` is instead derived from FPL price using the position's real
points-per-cost ratio among established players, since there's no real
history to draw from.

Before a real draft:

- Treat `EST`-badged players' points as rougher guesses and adjust
  by eye.
- Re-fetch `bootstrap-static` periodically during the season if you
  want points to reflect the current season rather than last season's
  baseline.
- Edit any player's points inline (click to edit in the table), or
  edit the data file directly.

## How VORP is calculated

For each position (GK/DEF/MID/FWD):

1. Take all currently **undrafted** players at that position, sorted by
   projected points descending.
2. **Replacement level** = the points of the Nth player in that list,
   where N is the position's configurable "replacement rank" (defaults:
   GK 9, DEF 31, MID 31, FWD 18 — tuned for an 8-team snake draft with
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
