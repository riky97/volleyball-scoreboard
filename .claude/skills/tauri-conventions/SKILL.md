---
name: tauri-conventions
description: Rules for touching Tauri APIs, Rust commands or capabilities in this app. Use whenever code imports @tauri-apps/*, edits src-tauri/, or adds a native feature (dialogs, files, window).
user-invocable: false
---

# Tauri conventions (Tauri 2)

- **Always guard with `isTauri()`** (from `@tauri-apps/api/core`) and provide a browser fallback — the app must keep working under `npm run dev` in a plain browser. See `exportCsvReport` and `confirmAndDispatch` in `src/components/ScoreboardPage.tsx` for the pattern (`window.confirm` / Blob download as fallbacks).
- **Permissions**: every Tauri API or plugin call needs its permission in `src-tauri/capabilities/default.json` (e.g. `dialog:allow-save`, `core:window:allow-close`). Missing permissions fail only at runtime in the desktop app, not in the browser — check this file every time.
- **New plugin**: add the npm package (`@tauri-apps/plugin-*`), the Rust crate in `src-tauri/Cargo.toml` (`tauri-plugin-*`), `.plugin(...::init())` in `src-tauri/src/lib.rs`, and its permissions.
- **Custom Rust command**: define `#[tauri::command] fn ...` in `src-tauri/src/lib.rs`, register it in `tauri::generate_handler![...]`, call it with `invoke("name", { camelCaseArgs })`. Return `Result<T, String>` so errors reach the JS `catch`.
- **This is Tauri 2, not 1**: no `allowlist` in `tauri.conf.json`, no `@tauri-apps/api/tauri` or `/dialog` imports — dialogs live in `@tauri-apps/plugin-dialog`, window in `@tauri-apps/api/window`. When unsure, look up the v2 docs (context7) rather than guessing.
