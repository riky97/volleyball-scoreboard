# Volleyball Scoreboard

Desktop volleyball scoreboard (Windows target) built with **Tauri 2 + React 19 + TypeScript + Vite**. UI text is in Italian.

## Commands

- `npm run dev` — Vite dev server on http://localhost:5173 (runs in the browser; Tauri APIs fall back via `isTauri()`)
- `npm run tauri dev` — run the desktop app (needs Rust toolchain)
- `npm run build` — `tsc -b && vite build` (typecheck + bundle to `dist/`)
- `npm run tauri build` — build the installer
- `npm run lint` — ESLint (flat config, `eslint.config.js`)

No test suite exists yet.

## Architecture

- `src/models/match.ts` — domain types (`MatchState`, `MatchRules`, `TeamState`, `SetSnapshot`) and pure helpers (set target, sets to win). `STORAGE_KEY` is versioned (`.v1`): bump it if the persisted shape changes.
- `src/state/matchReducer.ts` — all match logic as a pure reducer (`matchReducer`) wrapped by `undoableMatchReducer` (history capped at 200). Actions are namespaced strings (`point.increment`, `set.award`, …). Keep game rules here, not in components.
- `src/state/persistence.ts` — localStorage load/save (debounced 150 ms from `ScoreboardPage`).
- `src/utils/matchReportCsv.ts` — CSV report for a finished match.
- `src/components/ScoreboardPage.tsx` — main screen: keyboard shortcuts, close confirmation, CSV export, wiring of the reducer.
- `src/components/` — `TeamPanel`, `SetIndicator`, `SettingsModal`.
- `src/App.css` / `src/index.css` — plain CSS, BEM-like class names (`topBar__left`, `btn--ghost`), CSS variables for theme and `--tv-scale` for large displays.
- `src-tauri/` — Rust shell. One custom command `write_text_file` (used for CSV export). Permissions in `src-tauri/capabilities/default.json`: any new Tauri API/plugin call needs its permission added there.

## Keyboard shortcuts (ScoreboardPage)

`q`/`a` home +/−, `p`/`l` away +/−, `w`/`o` timeout home/away, `1`/`2` serving, `u` undo.

## Conventions

- 4-space indent, double quotes, semicolons, `type` aliases over interfaces.
- Always guard Tauri-only APIs with `isTauri()` and provide a browser fallback.
- Default team names are `"Casa"` / `"Ospite"`.
- Version lives in both `package.json` and `src-tauri/tauri.conf.json`: keep them in sync on release.

## Known issues

`npm run lint` currently reports 2 pre-existing errors: a useless escape in `ScoreboardPage.tsx` (regex in `buildDefaultCsvFileName`) and `setState` inside an effect in `SettingsModal.tsx`.
