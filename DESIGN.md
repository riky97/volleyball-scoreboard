---
name: Segnapunti Pallavolo
description: Club volleyball scoreboard: a scorer window on the PC and a public board window on the gym's big screen.
colors:
  app-bg: "#0b1120"
  surface: "#111a2e"
  surface-2: "#0f172a"
  border: "#1e293b"
  border-strong: "#334155"
  text: "#f8fafc"
  muted: "#94a3b8"
  muted-strong: "#cbd5e1"
  on-primary: "#ffffff"
  primary: "#2563eb"
  home: "#3b82f6"
  away: "#f97316"
  serve: "#facc15"
  live: "#4ade80"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "calc(clamp(120px, 12vw, 280px) * var(--tv-scale))"
    fontWeight: 900
    letterSpacing: "-2px"
    fontFeature: "tnum"
  headline:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "calc(clamp(22px, 1.6vw, 34px) * var(--tv-scale))"
    fontWeight: 800
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "calc(clamp(18px, 1.2vw, 26px) * var(--tv-scale))"
    fontWeight: 700
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "calc(clamp(14px, 1vw, 20px) * var(--tv-scale))"
    fontWeight: 800
    lineHeight: 1.4
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "calc(clamp(12px, 0.9vw, 16px) * var(--tv-scale))"
    fontWeight: 700
rounded:
  dot: "4px"
  control: "10px"
  inset: "12px"
  bar: "14px"
  dialog: "16px"
  panel: "18px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
    typography: "{typography.body}"
  button-neutral:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    typography: "{typography.body}"
  button-ghost:
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    typography: "{typography.body}"
  button-danger:
    backgroundColor: "color-mix(in srgb, #ef4444 15%, transparent)"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    typography: "{typography.body}"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  inset-box:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.inset}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.inset}"
---

# Design System: Segnapunti Pallavolo

## Overview

**Creative North Star: "Il Tabellone di Palestra" (The Gym Scoreboard)**

The interface behaves like the electronic scoreboard on a gym wall: the two point totals dominate the screen and everything else exists to serve them. It is shown at the same time to a volunteer scorer working at arm's length and to players and spectators reading it from across the court, so every decision is judged first by distance legibility and only then by density.

The look is a dark gym scoreboard: white numerals on deep navy (`#0B1120`), dark navy panels separated by thin borders. Colour is rationed and always means something: blue is the home team and the primary action, orange is the away team, yellow marks who is serving, green marks the live board and the winner, red only the destructive action. Type is the platform sans in heavy weights, and the score numerals are set at poster size with tabular figures so they never jump as they change.

The app has two windows. The **scorer window** on the PC holds the controls around a 16:9 preview; the **public board** window goes full screen on the 40–50" monitor and shows nothing but the scoreboard. Both render the same `Scoreboard` component, so the preview is exactly what the gym sees. The theme is dark today but may switch back to light: every colour is a CSS variable in `src/index.css`, so a light theme is a change of values only.

The scorer window scales for large displays through a single multiplier (`--tv-scale`); the board scales with its own box (container units).

**Key Characteristics:**
- Score numerals at poster size (up to 280px × scale), weight 900, tabular figures.
- Dark navy ground and panels, thin borders; white numerals.
- Every colour carries one meaning: blue home/action, orange away, yellow serve, green live/winner, red danger.
- Heavy, legible weights (700–900) throughout; nothing thin.
- The public board sizes everything in container units, so it fills any window from the preview box to a 4K TV.

## Colors

A dark, low-chroma navy palette with a few saturated signals, each with one job.

### Primary
- **Action Blue** (`primary`): primary buttons (+1, Annulla, Salva). Darker than Home Blue so white text on it passes contrast.

### Team and state signals
- **Home Blue** (`home`): home team bar, home sets-won number, home panel accents. Home is always on the left.
- **Away Orange** (`away`): the same for the away team, on the right. Orange instead of red so the two teams differ in lightness too, not only in hue.
- **Serve Yellow** (`serve`): only the volleyball icon next to the team that is serving.
- **Live Green** (`live`): only "Tabellone aperto" and the winner ("FINE PARTITA", "Vincitore").
- **Whistle Red** (`danger`): only "Nuova partita", as a tinted fill.

### Neutral
- **Gym Night** (`app-bg`): the ground of both windows and of the board.
- **Panel Navy** (`surface`): bars and control groups; `surface-2` for nested boxes.
- **Line** (`border`) and **Frame** (`border-strong`): borders; the frame outlines the preview.
- **Chalk** (`text`): all primary text and the numerals. **Muted** / **Muted Strong**: labels, timeouts, set status.

### Named Rules
**The One Meaning Rule.** Each signal colour has exactly one job (see above). Never use one decoratively or for a second meaning.

**The Variables Only Rule.** Every colour lives in `:root` of `src/index.css`. Components and `App.css` use `var(--…)` or `color-mix()` on a variable, never a literal colour, so a light theme is only a change of values.

## Typography

**Display Font:** the platform sans (`system-ui`, falling back to Segoe UI on Windows).
**Body Font:** the same stack.

**Character:** one family, carried by weight. Heavy weights read from a distance and under gym lighting; no light or thin cuts are used anywhere.

### Hierarchy
- **Display** (900, `clamp(120px, 12vw, 280px)` × scale, -2px tracking, tabular figures): the two point totals only.
- **Headline** (800, `clamp(22px, 1.6vw, 34px)` × scale): the sets-won score in the set row.
- **Title** (700–800, `clamp(18px, 1.2vw, 26px)` × scale): app title, team names, centre panel title, dialog title.
- **Body / Control** (800, `clamp(14px, 1vw, 20px)` × scale): buttons and inputs.
- **Label** (600–800, `clamp(12px, 0.9vw, 16px)` × scale, muted): chips, field labels, section labels, hints.

### Named Rules
**The Numerals First Rule.** Nothing on screen may compete with the display numerals in size or weight. A new element that needs to be large is a sign it belongs elsewhere.

**The Fluid × Scale Rule.** Every font size is a `clamp()` multiplied by `--tv-scale`. Never ship a fixed pixel font size.

## Layout

Two windows.

- **Scorer window** (`ScoreboardPage`): a full-height column, max 1600px wide (full width from 2400px). Top bar (title and match status; "Apri tabellone" or "● Tabellone aperto" + "Chiudi tabellone"; Impostazioni; Nuova partita), then the 16:9 board preview taking all the free height, then the controls row: home group (left), centre group (Annulla, "Altre azioni…"), away group (right). The "Altre azioni…" menu opens upwards over the preview. No scroll from 1280×720 up.
- **Board window** (`BoardWindow`, `?view=board`): the `Scoreboard` alone, edge to edge, no cursor.

Inside the scorer window paddings and gaps are fluid (`clamp()` × `--tv-scale`); inside the board everything is in container units.

### Named Rules
**The Mirror Rule.** Home is always left, away always right, in every row: board, preview and controls. Keyboard shortcuts follow the same sides (Q/A, W, 1 left; P/L, O, 2 right).

## Elevation & Depth

Nearly flat. On the dark ground depth comes from tone: panels are a lighter navy than the ground, nested boxes darker, all with thin borders. One soft shadow remains on top-level blocks. The public board has no panels at all: numerals sit directly on the ground. The dialog sits over a dark scrim (`--overlay`).

### Shadow Vocabulary
- **Ambient** (`--shadow`: `0 10px 30px rgba(0, 0, 0, 0.35)`): top-level blocks of the scorer window, never nested ones, never on the board.

### Named Rules
**The One Shadow Rule.** There is exactly one shadow. Depth beyond that comes from tone (lighter or darker navy), never from a second, stronger shadow.

## Shapes

Soft rounded rectangles throughout, with radius growing with the size of the container: 4px set dots, 10px controls, 12px inset boxes and inputs, 14px bars, 16px dialog and control groups, 18px score panels. Chips and badges are full pills. Every container has a 1px hairline border.

## Components

### Buttons
- **Shape:** gently rounded (10px), 1px hairline border, weight 800, fluid padding × scale.
- **Primary:** Action Blue fill, white text. Used for the most frequent action in a group (+1, Annulla, Salva).
- **Neutral / Ghost:** nested-navy or transparent fill, Chalk text. Everything that is not the primary action.
- **Danger:** red at 12% fill with a 35% red border; only "Nuova partita", always behind a confirmation.
- **Icon button:** ghost button with a centred icon; must carry `aria-label` and a tooltip.
- **Hover / Focus:** hover brightens the border to Frame; focus shows a 3px blue focus ring offset by 2px. Disabled ghost buttons drop to 50% opacity.

### Chips
- **Style:** pill, nested-navy fill, thin border, label type. Used for set, target and sets-to-win in the top bar, timeout counts and the "Servizio" badge in team panels.

### Cards / Containers
- **Panel:** Panel Navy, 16–18px radius, ambient shadow, thin border.
- **Inset box:** nested navy, 12px radius, thin border, no shadow.

### Inputs / Fields
- **Style:** Panel Navy fill, thin border, 12px radius, fluid padding × scale. Labels above in muted label type.
- **Focus:** the shared 3px blue focus ring.

### Public Scoreboard (signature component)
`Scoreboard` (`src/components/Scoreboard.tsx`, `.board…` in `App.css`): the only thing on the big monitor and, at 16:9, the preview in the scorer window.
- **Top row:** home name with a blue bar (left), away name with an orange bar (right), one line each with ellipsis; "Timeout n" under each name; the yellow ball next to the serving team; in the middle "SET n" (with "· Tie-break" in the deciding set).
- **Centre:** the two point totals at poster size (`min(52cqh, 21cqw)`, weight 900, tabular), and between them "SET VINTI" with the sets won in blue and orange.
- **Match over:** the middle reads "FINE PARTITA" in green, the winner shows "Vincitore" in green under its name, the last set's points stay visible, the ball is hidden.
- **Sizing:** `container-type: size` on the root; every size in `cqh`/`cqw`, never px, so it scales with its box.

## Do's and Don'ts

### Do:
- **Do** multiply every new size (type, padding, radius where it matters) by `--tv-scale`.
- **Do** keep home left / away right in any new element.
- **Do** keep long team names to one or two lines with ellipsis and the full name in a tooltip.
- **Do** give every icon-only control an `aria-label`.
- **Do** keep everything on one screen from 720p up: if a change adds height, take it from somewhere else.
- **Do** put anything the public must read in `Scoreboard`, so the preview and the TV can never differ.

### Don't:
- **Don't** give a signal colour (blue, orange, yellow, green, red) a second meaning or use it as decoration.
- **Don't** write a literal colour outside `src/index.css`.
- **Don't** add a second shadow or shadows on nested boxes.
- **Don't** use light or thin font weights, or fixed pixel font sizes.
- **Don't** load web fonts or any other network asset: the app must work offline.
