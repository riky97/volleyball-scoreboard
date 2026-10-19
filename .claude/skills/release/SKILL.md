---
name: release
description: Prepare a new release of the app — bump the version everywhere, verify the build, tag and draft release notes.
disable-model-invocation: true
argument-hint: <new-version, e.g. 1.1.0>
---

Prepare release `$ARGUMENTS` (semver, no leading `v`). If no version is given, ask for one.
Work on `develop` (switch to it and pull first); `master` only receives the finished release.

1. Set the version in all three places (they must match):
   - `package.json` → `"version"`
   - `src-tauri/tauri.conf.json` → `"version"`
   - `src-tauri/Cargo.toml` → `[package] version`
   Then run `npm install --package-lock-only` and `cargo update -p app --manifest-path src-tauri/Cargo.toml` so the lockfiles follow (never edit lockfiles by hand).
2. Verify: `npm run lint`, `npm test`, `npm run build`. Stop and report if any fails.
3. If the Rust toolchain is available, run `npm run tauri build` and report where the installer was written (`src-tauri/target/release/bundle/`).
4. Draft release notes from `git log <last-tag>..HEAD --oneline`, grouped as Novità / Correzioni / Altro, in Italian (the app's audience is Italian).
5. Commit on `develop` as `Release v$ARGUMENTS`, merge `develop` into `master` (`git checkout master && git merge --no-ff develop`), and create tag `v$ARGUMENTS` on `master`. Do NOT push `master`, the tag or publish the GitHub release without explicit confirmation.
