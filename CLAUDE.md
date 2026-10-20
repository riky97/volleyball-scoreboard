# Volleyball Scoreboard

Desktop volleyball scoreboard (Windows target) built with **Tauri 2 + React 19 + TypeScript + Vite**. UI text is in Italian.

## Commands

- `npm run dev` — Vite dev server on http://localhost:5173 (runs in the browser; Tauri APIs fall back via `isTauri()`)
- `npm run tauri dev` — run the desktop app (needs Rust toolchain)
- `npm run build` — `tsc -b && vite build` (typecheck + bundle to `dist/`)
- `npm run tauri build` — build the installer
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm test` — Vitest unit tests (`src/**/*.test.ts`, pure logic only)

## Architecture

- `src/models/match.ts` — domain types (`MatchState`, `MatchRules`, `TeamState`, `SetSnapshot`) and pure helpers (set target, sets to win). `STORAGE_KEY` is versioned (`.v1`): bump it if the persisted shape changes.
- `src/state/matchReducer.ts` — all match logic as a pure reducer (`matchReducer`) wrapped by `undoableMatchReducer` (history capped at 200). Actions are namespaced strings (`point.increment`, `set.award`, …). Keep game rules here, not in components.
- `src/state/persistence.ts` — localStorage load/save (debounced 150 ms from `ScoreboardPage`).
- `src/utils/matchReportCsv.ts` — CSV report for a finished match.
- Two windows from one bundle: `src/App.tsx` renders `BoardWindow` when the URL has `?view=board`, else `ScoreboardPage`.
- `src/components/ScoreboardPage.tsx` — scorer window (single source of truth): reducer, keyboard shortcuts, board preview, controls, "Altre azioni…" menu, close confirmation (also closes the board), CSV export, Apri/Chiudi tabellone.
- `src/components/Scoreboard.tsx` — the public scoreboard; used both in the board window and as the 16:9 preview. Sized in container units (`cqh`/`cqw`). Anything the public must read goes here.
- `src/components/BoardWindow.tsx` — board window: renders `Scoreboard`, F11 / double click = fullscreen, forwards shortcuts to the scorer, never changes state.
- `src/board/channel.ts` — scorer ⇄ board messages (`match:state`, `board:hello`, `board:action`): Tauri events in the app, `BroadcastChannel` in the browser. `src/board/boardWindow.ts` — open/close the board window (`WebviewWindow` label `board`, `window.open` in the browser).
- `src/state/shortcuts.ts` — key → `MatchAction` map shared by both windows.
- `src/components/SettingsModal.tsx` — settings dialog.
- `src/App.css` / `src/index.css` — plain CSS, BEM-like class names (`topBar__left`, `btn--ghost`). Dark theme; every colour is a variable in `:root` of `index.css` (never a literal elsewhere). `--tv-scale` scales the scorer window on large displays.
- `src-tauri/` — Rust shell. One custom command `write_text_file` (used for CSV export); `tauri-plugin-window-state` remembers the board window's position/size/fullscreen. Permissions in `src-tauri/capabilities/default.json` (windows `main` and `board`): any new Tauri API/plugin call needs its permission added there.

## Keyboard shortcuts (`src/state/shortcuts.ts`)

`q`/`a` home +/−, `p`/`l` away +/−, `w`/`o` timeout home/away, `1`/`2` serving, `u` undo. They work in both windows (the board forwards them). In the board window F11 or double click toggles fullscreen.

## Branches

- `develop` — working branch: all development, tests and fixes go here (or on feature branches merged into it).
- `master` — published releases only. Never commit directly; it only receives merges from `develop` via `/release`.

## Conventions

- 4-space indent, double quotes, semicolons, `type` aliases over interfaces.
- Always guard Tauri-only APIs with `isTauri()` and provide a browser fallback.
- Default team names are `"Casa"` / `"Ospite"`.
- Version lives in `package.json`, `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml` (currently out of sync: Cargo says 0.1.0): use `/release` to bump all three.

## Claude Code setup (`.claude/`)

- Hooks: ESLint `--fix` runs after every edit of a `.ts/.tsx` file (remaining errors are reported back); direct edits to `package-lock.json` / `Cargo.lock` are blocked.
- Skills: `/release <version>` (bump version in package.json, tauri.conf.json, Cargo.toml + build + tag); `tauri-conventions` (auto-loaded rules for Tauri code).
- Subagents: `test-writer` (Vitest tests for the reducer/models/utils), `ui-reviewer` (TV readability + a11y review, read-only).
- MCP (`.mcp.json`): `context7` for up-to-date Tauri 2 / React 19 docs, `playwright` to check the UI under `npm run dev`.
