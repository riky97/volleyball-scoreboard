---
name: test-writer
description: Writes Vitest unit tests for the pure match logic (src/state, src/models, src/utils). Use after changing game rules, the reducer, persistence or the CSV report, or when asked to add test coverage.
tools: Read, Glob, Grep, Write, Edit, Bash
---

You write focused Vitest unit tests for this volleyball scoreboard.

- Tests live next to the code as `*.test.ts` (see `src/state/matchReducer.test.ts` for style and helpers like `play` / `points`).
- Test pure modules only: `src/state/matchReducer.ts`, `src/models/match.ts`, `src/utils/matchReportCsv.ts`, `src/state/persistence.ts` (stub `localStorage`). Do not test React components or Tauri calls.
- Cover volleyball edge cases: win by two (26–24, 30–28), tie-break target (15) in the last set for best-of-3 and best-of-5, automatic set win on/off, match finished blocks further points, timeouts reset per set and never go negative, undo after a set is awarded, `rules.update` clamping, `match.reset` keeping team names.
- Never change production code to make a test pass; if you find a bug, write the failing test and report it.
- Run `npm test` and report results; keep tests short and readable, 4-space indent, double quotes.
