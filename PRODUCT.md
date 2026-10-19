# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Scorer (operator):** a volunteer of an amateur or youth volleyball club who runs the app on a PC at the side of the court during a match, updating points, timeouts and serve as play happens, mostly by keyboard.
- **Audience on the big screen:** players, coaches and spectators in the gym who read the score on a TV or projector connected to that PC.

## Product Purpose

A desktop volleyball scoreboard for club matches: one person keeps the official score live and the whole gym can read it on a large screen. Success means the score is always correct, readable from across the gym, and quick to correct when the scorer makes a mistake.

## Operating Context

- Gyms during club matches; the PC is usually connected to a TV or projector that the public watches.
- The same window shows both the scoreboard and the scorer's controls (there is no separate public view yet).
- The scorer works under time pressure and often uses keyboard shortcuts (Q/A, P/L, W/O, 1/2, U for undo) without looking at the controls.
- At the end of a match the scorer can export a CSV report of the sets.

## Capabilities and Constraints

- **Offline is mandatory:** gyms often have no internet; nothing may depend on the network (no remote fonts, APIs or telemetry).
- Windows desktop app (Tauri 2 shell around a React UI); also runs in a browser for development.
- Match rules are configurable: best of 3 or 5, points per set and tie-break, win by two, automatic set award, timeouts per set.
- State is saved locally and survives restarts; every action can be undone.
- UI language: Italian. Default team names are "Casa" and "Ospite".
- Open decision: whether to split the public scoreboard from the scorer's controls (e.g. a second window for the TV).

## Brand Commitments

Name in the UI: "Segnapunti Pallavolo". No logo or club brand to apply.

## Evidence on Hand

No real users' feedback, screenshots of use in a gym, club names or testimonials exist in the repo. Do not invent them.

## Product Principles

1. The score is the hero: readable from the far side of a gym before anything else.
2. Correct over fast, but fast enough for live play: every action is reversible and destructive ones are confirmed.
3. Works with no network, every time.
4. The scorer is a volunteer: obvious controls, keyboard-first, hard to make irreversible mistakes.

## Accessibility & Inclusion

Large-screen readability at distance (high contrast, large numerals, no information carried by color alone) and full keyboard operation for the scorer.
