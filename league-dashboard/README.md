# League Dashboard

A live status page for the "familia de nuñez" FPL Draft league — standings
and squad, pulled fresh from the official (public, unauthenticated) Draft
API on every page load. No login, no scraping the shaky in-app scoreboard.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it works

`lib/fpl-draft.js` fetches from `draft.premierleague.com/api`:

- `bootstrap-static` for player/team names and the current gameweek
- `league/{id}/details` for standings
- `league/{id}/element-status` for player ownership (used as a fallback
  roster source — see below)
- `entry/{id}/event/{gw}` for the squad's starting XI / bench order

The league ID and your entry ID are configurable via env vars
(`FPL_DRAFT_LEAGUE_ID`, `FPL_DRAFT_ENTRY_ID`); they default to this
league's actual IDs so it runs with zero config.

A gameweek's picks (and therefore lineup order) aren't published by the
API until that gameweek's deadline passes — there's a window after
waivers process but before kickoff where they 404. When that happens the
dashboard falls back to reconstructing the 15-man squad from ownership
data instead (flagged in the UI as "lineup order isn't published yet").

Nothing is cached — every request fetches live. Fine at this scale
(a handful of people checking a personal league occasionally); revisit
if that changes.

## Design

Shares the "pitch/gold" broadcast-scoreboard palette and type system
(Oswald display, IBM Plex Sans/Mono) with the sibling FPL Draft VORP
Tracker app at the repo root, so the two tools read as one site.
