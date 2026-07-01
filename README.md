# Trade Journal

A private, dual-workspace trading journal with a Gemini-style dark UI, an automated
R-multiple math engine, a visual trade gallery, a performance calendar, a rules
playbook, a daily discipline review, and a PD Array reference wiki.

Everything persists locally in the browser via `localStorage` — no backend, no
account, no external asset server. Images are downscaled and stored as
compressed base64 JPEGs.

## Deploying on bolt.new

1. Create a new bolt.new project (Vite + React + TypeScript template, or blank).
2. Copy every file in this folder into the project, preserving the folder
   structure (`src/components/`, `src/lib/`, etc.).
3. Make sure `package.json` matches the one here — it pulls in `lucide-react`
   for icons and Tailwind for styling.
4. Run `npm install` (bolt.new does this automatically on file changes) and
   the dev server will pick up `vite.config.ts` / `tailwind.config.js`
   automatically.

## Running locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  App.tsx                 # master state orchestrator (workspace, theme, privacy, view)
  types.ts                # shared TypeScript types
  lib/
    math.ts                # position size / PnL / R-multiple engine
    storage.ts              # localStorage persistence + image compression
  components/
    Header.tsx              # theme + privacy ("LARP mode") toggles
    Sidebar.tsx              # desktop + mobile navigation
    WorkspaceHub.tsx         # landing page: choose Daytime / Nighttime workspace
    Dashboard.tsx            # top metrics banner + recent trades
    TradeGallery.tsx         # searchable/filterable trade card grid
    TradeCard.tsx            # single trade summary card
    TradeForm.tsx            # trade entry/edit modal with math engine + uploads
    Lightbox.tsx             # fullscreen image viewer
    CalendarView.tsx         # monthly PnL calendar
    Playbook.tsx             # per-workspace rules & strategy notes
    DailyReview.tsx          # daily discipline checklist log
    Wiki.tsx                 # PD Array / concept reference cards
```

## Notes on the math engine

Given account balance, USD risk, entry, stop, and exit:

```
riskPerUnit   = |entry - stop|
positionSize  = usdRisk / riskPerUnit
rewardPerUnit = (exit - entry)          for longs
              = (entry - exit)          for shorts
netPnl        = positionSize * rewardPerUnit
rMultiple     = netPnl / usdRisk
```

Discipline Score = trades marked "Rules Followed" ÷ total trades in the
active workspace.
