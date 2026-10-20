# Tabellone pubblico in una seconda finestra — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** una seconda finestra con il solo tabellone (bozza B) per il monitor da 40–50", e la finestra del segnapunti ridisegnata (bozza PC 2) con l'anteprima del tabellone, tutto in tema scuro.

**Architecture:** la stessa app React apre una seconda finestra con `?view=board`; `App.tsx` sceglie la vista. Il segnapunti resta l'unica fonte della verità: pubblica lo stato a ogni cambio su un canale (eventi Tauri in Tauri, `BroadcastChannel` nel browser) e riceve dal tabellone solo le scorciatoie inoltrate. Il componente `Scoreboard` è lo stesso per finestra pubblica e anteprima, con misure in unità container query così scala a qualsiasi dimensione.

**Tech Stack:** React 19, TypeScript, Vite, Tauri 2 (`@tauri-apps/api` `WebviewWindow`, `emit`/`listen`, `setFullscreen`), crate `tauri-plugin-window-state` 2, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-20-tabellone-pubblico-design.md` (leggerlo prima di iniziare). Bozze: https://claude.ai/artifact/HqaB1JpZ9igN5ZodtinEyV (artboard "B" e "PC 2").

## Global Constraints

- Branch `develop`. Un commit per task.
- Offline: nessuna risorsa di rete, font di sistema.
- Tutti i colori solo via variabili CSS in `:root` di `src/index.css`; nessun colore letterale nei componenti o in `App.css`.
- Palette: fondo `#0B1120`, superfici `#111A2E`, bordi `#1E293B`, riquadro anteprima `#334155`, testo `#F8FAFC`, secondario `#94A3B8`/`#CBD5E1`, Casa `#3B82F6`, Ospite `#F97316`, servizio `#FACC15`, stato attivo `#4ADE80`, pericolo `rgba(239, 68, 68, …)`, pulsanti primari `#2563EB`.
- Tauri: ogni API Tauri protetta da `isTauri()` con fallback browser; permessi in `src-tauri/capabilities/default.json`.
- Logica di gioco solo in `src/state/matchReducer.ts`; il tabellone non modifica mai lo stato.
- Convenzioni: 4 spazi, doppi apici, `type` invece di `interface`, testi UI in italiano.
- Verifiche a ogni task: `npm run lint`, `npm test`, `npm run build` tutti verdi.
- Questo container non ha le librerie di sistema per compilare Tauri: la parte Rust e il comportamento delle finestre native si verificano su Windows (`npm run tauri dev`), indicato nei task.

## Review Focus

1. **Tabellone in primo piano mentre si segna**: Q/P/U premuti con il focus sulla finestra del tabellone devono cambiare il punteggio nel segnapunti → test di `shortcutAction` (Task 1) + verifica Playwright (Task 3).
2. **Tabellone aperto a partita in corso o riaperto**: deve mostrare subito lo stato attuale, mai uno stato vuoto o vecchio → richiesta `board:hello` + stato iniziale da `localStorage` (Task 3, verifica Playwright).
3. **Nomi squadra lunghi sul tabellone**: una riga con ellissi, punteggi della stessa dimensione → verifica visiva con nomi da 45 caratteri (Task 2).
4. **Tabellone chiuso con la sua X**: il segnapunti torna a "Apri tabellone" entro 1 s → Task 3 (browser: popup chiuso; Tauri: `tauri://destroyed`, verifica su Windows).
5. **Digitazione nei campi delle Impostazioni**: i tasti non devono diventare punti né essere inoltrati → `shortcutAction` ignora i tasti con modificatori; il filtro `isEditableTarget` esistente resta nel segnapunti (Task 1, Task 4).

---

### Task 1: Scorciatoie e vincitore come funzioni pure

**Files:**
- Create: `src/state/shortcuts.ts`, `src/state/shortcuts.test.ts`
- Modify: `src/models/match.ts` (aggiungere `getWinner`), `src/state/matchReducer.test.ts`
- Modify: `src/components/ScoreboardPage.tsx` (la mappa tasti inline usa `shortcutAction`)

**Interfaces:**
- Produces: `shortcutAction(e: { key: string; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean }): MatchAction | null` — `getWinner(state: MatchState): TeamSide | null`

- [ ] **Step 1: Test che falliscono**

```ts
// shortcuts.test.ts
expect(shortcutAction({ key: "q" })).toEqual({ type: "point.increment", team: "home" });
expect(shortcutAction({ key: "Q" })).toEqual({ type: "point.increment", team: "home" });
expect(shortcutAction({ key: "l" })).toEqual({ type: "point.decrement", team: "away" });
expect(shortcutAction({ key: "2" })).toEqual({ type: "serving.set", team: "away" });
expect(shortcutAction({ key: "u" })).toEqual({ type: "undo" });
expect(shortcutAction({ key: "q", ctrlKey: true })).toBeNull();
expect(shortcutAction({ key: "x" })).toBeNull();
// matchReducer.test.ts
it("getWinner returns null while in progress and the team with more sets when finished")
```

- [ ] **Step 2:** `npm test` → FAIL (moduli/funzioni mancanti).
- [ ] **Step 3:** implementare: mappa identica a quella attuale in `ScoreboardPage` (q/a, p/l, w/o, 1/2, u), chiave in minuscolo, `null` con Ctrl/Alt/Meta. `getWinner` = `null` se `status !== "finished"`, altrimenti la squadra con più `setsWon`. In `ScoreboardPage` sostituire la mappa inline con `shortcutAction(e)`.
- [ ] **Step 4:** `npm test`, `npm run lint`, `npm run build` → verdi.
- [ ] **Step 5:** commit `Extract keyboard shortcuts and winner into pure helpers`.

### Task 2: Tema scuro e componente `Scoreboard`

**Files:**
- Modify: `src/index.css` (token), `src/App.css` (sostituire ogni colore letterale con un token; nuova sezione `.board…`)
- Create: `src/components/Scoreboard.tsx`
- Modify: `DESIGN.md`, `.impeccable/design.json` (tema scuro)

**Interfaces:**
- Consumes: `getWinner`, `MatchState`.
- Produces: `Scoreboard({ match }: { match: MatchState }): JSX.Element` — riempie il contenitore padre (100% × 100%), nessun controllo interattivo.

- [ ] **Step 1: Token** in `:root`: `--app-bg #0b1120`, `--surface #111a2e`, `--surface-2 #0f172a`, `--border #1e293b`, `--frame #334155`, `--text #f8fafc`, `--muted #94a3b8`, `--muted-strong #cbd5e1`, `--primary #2563eb`, `--home #3b82f6`, `--away #f97316`, `--serve #facc15`, `--live #4ade80`, `--danger #ef4444`, `--focus rgba(59, 130, 246, 0.5)`, `color-scheme: dark`. Convertire i colori letterali di `App.css` (rgba di blu/rosso/verde) in token (`color-mix()` sui token va bene).
- [ ] **Step 2: `Scoreboard`** secondo la bozza B e la spec § Tabellone pubblico. Radice `.board` con `container-type: size`, fondo `--app-bg`; tutte le misure in `cqh`/`cqw`/`cqmin` (punti ≈ `52cqh`, nomi ≈ `7.5cqh`, set vinti ≈ `15cqh`): nessun px fisso per i testi.
  - Riga alta: barra verticale `--home`/`--away`, nome (una riga, `text-overflow: ellipsis`, `min-width: 0`), pallone giallo (SVG inline con `role="img" aria-label="Al servizio"`, stesso path delle bozze) accanto a chi serve; sotto il nome "Timeout n".
  - Centro alto: `SET n`, con `· Tie-break` quando `currentSet >= rules.bestOf`; a partita finita `Ha vinto <nome>`.
  - Centro: punti grandi (900, `tabular-nums`) e in mezzo "SET VINTI" con i due numeri colorati `--home`/`--away`.
- [ ] **Step 3: Verifica visiva** (browser, Playwright come nei test visivi precedenti, render temporaneo non committato o via Task 3): finestra 1920×1080 e 1280×720, nomi da 45 caratteri, set 5 (tie-break), partita finita → nessuno scroll, nomi su una riga, punti invariati.
- [ ] **Step 4:** aggiornare `DESIGN.md` (frontmatter colori e sezioni Colors/Components: tema scuro, Ospite arancione, servizio giallo, componente "Tabellone pubblico", regola "solo variabili CSS"; North Star invariata) e i colori in `.impeccable/design.json`.
- [ ] **Step 5:** lint/test/build verdi; commit `Add dark theme tokens and public Scoreboard component`.

### Task 3: Finestra del tabellone, sincronizzazione, apertura/chiusura

**Files:**
- Create: `src/board/channel.ts`, `src/board/boardWindow.ts`, `src/components/BoardWindow.tsx`
- Modify: `src/App.tsx`, `src/components/ScoreboardPage.tsx` (collegamento minimo: pulsante provvisorio "Apri tabellone" nella topbar esistente, publish/listen), `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`, `src-tauri/capabilities/default.json`

**Interfaces:**
- Consumes: `Scoreboard`, `shortcutAction`, `loadMatchState`.
- Produces (`channel.ts`), tutte con `isTauri()` → `emit`/`listen` di `@tauri-apps/api/event`, altrimenti `BroadcastChannel("volleyball-scoreboard")`:
  - `publishMatch(state: MatchState): void` — evento `match:state`
  - `onMatch(cb: (state: MatchState) => void): () => void`
  - `requestMatch(): void` / `onMatchRequest(cb: () => void): () => void` — evento `board:hello`
  - `sendAction(action: MatchAction): void` / `onAction(cb: (action: MatchAction) => void): () => void` — evento `board:action`
  - Le funzioni `on…` restituiscono un unsubscribe sincrono (in Tauri conservare la promise di `listen` e chiamarne il risultato).
- Produces (`boardWindow.ts`): `BOARD_LABEL = "board"`; `openBoard(onClosed: () => void): Promise<void>` (se già aperto: `setFocus()`); `closeBoard(): Promise<void>`. Tauri: `new WebviewWindow("board", { url: "/?view=board", title: "Tabellone", width: 1280, height: 720 })`, chiusura rilevata con `once("tauri://destroyed")`. Browser: `window.open("/?view=board", "board", "popup,width=1280,height=720")`, chiusura rilevata controllando `handle.closed` ogni 1000 ms.
- Produces: `BoardWindow(): JSX.Element`.

- [ ] **Step 1: `App.tsx`** → `new URLSearchParams(window.location.search).get("view") === "board"` ? `<BoardWindow />` : `<ScoreboardPage />`.
- [ ] **Step 2: `BoardWindow`**: stato iniziale `loadMatchState()` (poi `requestMatch()` al mount), aggiornato da `onMatch`; render `<Scoreboard>` a tutta finestra, `cursor: none`, `overflow: hidden`; `keydown`: F11 (con `preventDefault`) o `dblclick` → schermo intero (Tauri: `getCurrentWindow().setFullscreen(!(await isFullscreen()))`; browser: `requestFullscreen`/`exitFullscreen`); ogni altro tasto → `shortcutAction(e)` e, se non nullo, `sendAction`. Il tabellone non chiama mai il reducer. Senza stato (nessuna partita salvata) mostra "In attesa del segnapunti…".
- [ ] **Step 3: segnapunti** (in `ScoreboardPage`): `useEffect` su `match` → `publishMatch(match)` subito (non la versione con debounce); `onMatchRequest` → `publishMatch(ultimo stato da ref)`; `onAction` → `dispatch(action)`; stato `boardOpen` aggiornato da `openBoard(() => setBoardOpen(false))`; nel gestore di chiusura app esistente chiamare `await closeBoard()` prima di `appWindow.close()`.
- [ ] **Step 4: Tauri**: `Cargo.toml` → `tauri-plugin-window-state = "2"`; `lib.rs` → `.plugin(tauri_plugin_window_state::Builder::default().with_denylist(&["main"]).build())` (ricorda posizione, dimensione e schermo intero del solo tabellone; nessun salvataggio di "era aperto"); `default.json` → `"windows": ["main", "board"]` e permessi `core:webview:allow-create-webview-window`, `core:window:allow-set-fullscreen`, `core:window:allow-is-fullscreen`, `core:window:allow-set-focus`.
- [ ] **Step 5: Verifica Playwright (browser)**: aprire il segnapunti, segnare 3 punti, cliccare "Apri tabellone" → il popup mostra subito 3; premere `q` nel popup → il segnapunti mostra 4 e il popup 4; chiudere il popup → entro 1 s ricompare "Apri tabellone"; riaprire → stato attuale. Screenshot del popup a 1920×1080.
- [ ] **Step 6:** lint/test/build verdi; commit `Add public board window with live sync`. Annotare nel messaggio che la parte Tauri va provata su Windows con `npm run tauri dev` (apertura, F11/doppio clic, X, posizione ricordata alla riapertura, chiusura dell'app che chiude il tabellone).

### Task 4: Finestra del segnapunti secondo la bozza PC 2

**Files:**
- Modify: `src/components/ScoreboardPage.tsx`, `src/App.css`, `src/components/SettingsModal.tsx` (solo se servono classi per il tema)
- Delete: `src/components/TeamPanel.tsx`, `src/components/SetIndicator.tsx` e le loro regole CSS, più ogni classe CSS rimasta senza uso
- Modify: `CLAUDE.md` (architettura: finestra `?view=board`, `src/board/`, `Scoreboard`; rimuovere i componenti cancellati)

**Interfaces:**
- Consumes: `Scoreboard`, `openBoard`/`closeBoard`, `shortcutAction`, `getWinner`.

- [ ] **Step 1: layout** secondo spec § Finestra del segnapunti e bozza PC 2:
  - Barra alta: titolo; `boardOpen` ? "● Tabellone aperto" (`--live`) + "Chiudi tabellone" : "Apri tabellone"; "Impostazioni"; "Nuova partita" (pericolo, conferma esistente).
  - Centro: riquadro anteprima `aspect-ratio: 16 / 9`, bordo `--frame`, centrato, alto quanto lo spazio disponibile, con dentro `<Scoreboard match={match} />`.
  - Basso: tre gruppi. Casa: "+1 (Q)" primario grande, "−1 (A)", "Timeout · n (W)", "Servizio (1)"; centro: "Annulla (U)" primario e "Altre azioni…"; Ospite speculare con P/L/O/2.
  - "Altre azioni…" = `<details>` con: "Azzera set" (conferma esistente), "Assegna set a <Casa>", "Assegna set a <Ospite>", "Esporta report CSV" (disabilitato finché la partita non è finita; tooltip come oggi).
- [ ] **Step 2:** cancellare i componenti e il CSS non più usati; `npm run lint` senza import inutilizzati.
- [ ] **Step 3: Verifica visiva Playwright** a 1366×768, 1920×1080 e 3840×2160: nessuno scroll, anteprima 16:9 identica al popup del tabellone, nomi da 45 caratteri, partita finita (anteprima con "Ha vinto…", CSV attivo nel menu), finestra Impostazioni leggibile in scuro; nessun errore in console.
- [ ] **Step 4:** controllo design: `impeccable detect --json` sui file UI modificati (vedi skill impeccable), correggere i problemi reali; contrasto testo ≥ 4.5:1 (pulsanti primari su `--primary #2563eb`).
- [ ] **Step 5:** aggiornare `CLAUDE.md`; lint/test/build verdi; commit `Redesign scorer window with board preview (PC 2)`.
