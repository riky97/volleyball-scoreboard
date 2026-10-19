---
name: Segnapunti Pallavolo
description: Club volleyball scoreboard for a scorer's PC and the gym's big screen.
colors:
  app-bg: "#f3f4f6"
  surface: "#ffffff"
  surface-2: "#f9fafb"
  text: "#0f172a"
  muted: "rgba(15, 23, 42, 0.65)"
  border: "rgba(15, 23, 42, 0.14)"
  primary: "#2563eb"
  focus: "rgba(37, 99, 235, 0.35)"
  danger: "#dc2626"
  success: "#16a34a"
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
    textColor: "{colors.surface}"
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
    backgroundColor: "rgba(220, 38, 38, 0.12)"
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

The look is clean and functional, and it is the style to keep. White surfaces sit on a cool light-grey ground, separated by hairline borders and one soft ambient shadow. Colour is rationed: a single blue carries action and progress, red marks only the destructive action, green marks only the winner. Type is the platform sans in heavy weights, and the score numerals are set at poster size with tabular figures so they never jump as they change.

The whole system scales as one unit for large displays through a single multiplier (`--tv-scale`), instead of separate layouts per screen size.

**Key Characteristics:**
- Score numerals at poster size (up to 280px × scale), weight 900, tabular figures.
- White panels on light grey, hairline borders, one ambient shadow.
- One accent colour (blue) for actions and sets won; red and green reserved for meaning.
- Heavy, legible weights (700–900) throughout; nothing thin.
- Uniform scaling for TVs via `--tv-scale` (1 → 1.12 → 1.25 → 1.35).

## Colors

A neutral, light, low-chroma palette with one functional blue and two semantic signals.

### Primary
- **Scoreboard Blue** (`primary`): primary buttons (+1, Annulla, Salva), sets-won dots, and at reduced opacity the focus ring (`focus`) and the home panel's border tint. It is the only colour that means "act" or "progress".

### Neutral
- **Gym Floor Grey** (`app-bg`): the page ground behind every panel.
- **Panel White** (`surface`): panels, bars, dialog, inputs.
- **Inset Grey** (`surface-2`): secondary boxes inside panels (manual set, shortcuts), chips, neutral buttons.
- **Ink Navy** (`text`): all primary text and the score numerals.
- **Muted Ink** (`muted`): labels, subtitles, secondary meta.
- **Hairline** (`border`): every border; darkens on button hover.

### Semantic
- **Whistle Red** (`danger`): only "Nuova partita" (tinted background) and the away panel's border tint.
- **Winner Green** (`success`): only the end-of-match winner banner, at 12% fill with a 25% border.

### Named Rules
**The One Accent Rule.** Blue is the only colour for actions and progress. Red and green are signals with exactly one job each; never use them decoratively.

**The Tint, Don't Paint Rule.** Team identity is carried by a faint border tint (blue home, red away), never by filling panels with colour. The numerals stay ink on white.

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

A centred column (max 1600px; full width from 2400px viewport width up) stacked top to bottom: top bar (title, set chips, actions), set row (team set dots and sets-won score), the score grid, then the two control groups.

The score grid has three columns: home panel, centre panel (420–560px × scale), away panel. The side columns use `minmax(0, 1fr)` so oversized numerals can never push the grid wider than the screen. Below 980px the grid stacks into one column. Controls sit in two equal columns, home left and away right, mirroring the panels above.

Page padding and gaps are fluid (`clamp(16px, 2.2vw, 40px)` and `clamp(14px, 1.6vw, 22px)`, both × scale); inside components the rhythm is 8 / 10 / 12px. The whole layout must fit one screen at 720p and up without scrolling.

### Named Rules
**The Mirror Rule.** Home is always left, away always right, in every row: set dots, panels and controls. Keyboard shortcuts follow the same sides (Q/A left, P/L right).

## Elevation & Depth

Nearly flat. Every top-level block (top bar, set row, panels, control groups) uses the same single ambient shadow; nested boxes are flat, with an inset grey fill and a hairline border instead. The dialog sits over a 35% ink scrim.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08)`): every top-level block, never nested ones.

### Named Rules
**The One Shadow Rule.** There is exactly one shadow. Depth beyond that comes from the grey inset fill, never from a second, stronger shadow.

## Shapes

Soft rounded rectangles throughout, with radius growing with the size of the container: 4px set dots, 10px controls, 12px inset boxes and inputs, 14px bars, 16px dialog and control groups, 18px score panels. Chips and badges are full pills. Every container has a 1px hairline border.

## Components

### Buttons
- **Shape:** gently rounded (10px), 1px hairline border, weight 800, fluid padding × scale.
- **Primary:** Scoreboard Blue fill, white text. Used for the most frequent action in a group (+1, Annulla, Salva).
- **Neutral / Ghost:** inset grey or transparent fill, ink text. Everything that is not the primary action.
- **Danger:** red at 12% fill with a 35% red border; only "Nuova partita", always behind a confirmation.
- **Icon button:** ghost button with a centred icon; must carry `aria-label` and a tooltip.
- **Hover / Focus:** hover darkens the border to 24% ink; focus shows a 3px blue focus ring offset by 2px. Disabled ghost buttons drop to 50% opacity.

### Chips
- **Style:** pill, inset grey fill, hairline border, label type. Used for set, target and sets-to-win in the top bar, timeout counts and the "Servizio" badge in team panels.

### Cards / Containers
- **Score panel:** white, 18px radius, ambient shadow, faint blue (home) or red (away) border tint. Team name clamped to two lines.
- **Inset box:** inset grey, 12px radius, hairline border, no shadow (manual set, shortcuts, winner banner in green).

### Inputs / Fields
- **Style:** white fill, hairline border, 12px radius, fluid padding × scale. Labels above in muted label type.
- **Focus:** the shared 3px blue focus ring.

### Score Numerals (signature component)
The two point totals: display type, centred in their panel with a minimum height so the panel does not jump between one and two digits.

## Do's and Don'ts

### Do:
- **Do** multiply every new size (type, padding, radius where it matters) by `--tv-scale`.
- **Do** keep home left / away right in any new element.
- **Do** keep long team names to one or two lines with ellipsis and the full name in a tooltip.
- **Do** give every icon-only control an `aria-label`.
- **Do** keep everything on one screen from 720p up: if a change adds height, take it from somewhere else.

### Don't:
- **Don't** introduce a second accent colour or use red/green outside their single meaning.
- **Don't** fill team panels with team colours; tint the border only.
- **Don't** add a second shadow or shadows on nested boxes.
- **Don't** use light or thin font weights, or fixed pixel font sizes.
- **Don't** load web fonts or any other network asset: the app must work offline.
