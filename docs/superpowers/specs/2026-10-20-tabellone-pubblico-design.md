# Tabellone pubblico in una seconda finestra — design

Data: 2026-10-20 · Branch: `develop` · Bozze visive: https://claude.ai/artifact/HqaB1JpZ9igN5ZodtinEyV (artboard **B · Scuro ad alto contrasto** per il pubblico, **PC 2 · Controlli sul layout del tabellone** per il segnapunti)

## Perché

In palestra il PC del segnapunti sta sul tavolo; sopra il tavolo, in alto e rivolto al campo, c'è un monitor da 40–50" collegato allo stesso PC. Il pubblico (squadre, panchine, spettatori) lo guarda da 8–10 m. Chi segna **non vede** il monitor.

Oggi l'app ha una sola finestra che mescola punteggio e controlli: sul monitor grande il pubblico vedrebbe pulsanti, scorciatoie e menu. Serve separare:

- **Finestra del segnapunti** (sul PC): controlli + un'anteprima fedele di ciò che vede il pubblico, così chi segna è sicuro che il tabellone sia giusto senza alzare lo sguardo.
- **Finestra del tabellone** (sul monitor grande): solo il tabellone, leggibile da 8–10 m.

## Obiettivi

1. Un pulsante **"Apri tabellone"** nella finestra del segnapunti apre una **nuova finestra** con il solo tabellone. L'utente la trascina sul monitor grande.
2. Nella finestra del tabellone: **F11 o doppio clic** = schermo intero senza bordi (e ritorno).
3. La finestra del tabellone **si riapre dove era stata lasciata** (posizione, dimensione e schermo intero) la volta successiva.
4. **"Chiudi tabellone"** la chiude; lo stato "Tabellone aperto" (pallino verde) / pulsante "Apri tabellone" nella barra del segnapunti riflette sempre la realtà, anche se la finestra viene chiusa dalla sua X.
5. Il tabellone si aggiorna **nello stesso istante** in cui il segnapunti agisce (tasto o clic).
6. **Tema scuro su tutta l'app** (segnapunti e tabellone), fondo `#0B1120`.
7. La finestra del segnapunti viene ridisegnata secondo la bozza **PC 2**.

## Non obiettivi

- Nessun interruttore chiaro/scuro ora (vedi Vincoli: deve restare facile aggiungerlo).
- Nessun posizionamento automatico sul secondo schermo e nessun rilevamento del monitor: lo sposta l'utente.
- Nessuna tabella dei parziali dei set sul tabellone (bozza C scartata).
- Nessun controllo dal monitor grande: è solo visualizzazione.
- Nessuna modifica alle regole di gioco, al reducer, al report CSV.

## Anti-obiettivi (sarebbe un fallimento anche se "funziona")

- Il tabellone mostra un punteggio diverso da quello del segnapunti, anche per un attimo visibile o dopo un riavvio.
- Sul monitor grande compare qualsiasi controllo, cursore lasciato sopra i numeri, barra di scorrimento o testo piccolo illeggibile da 8–10 m.
- Chiudere o aprire il tabellone fa perdere o azzera la partita in corso.
- Serve internet per qualsiasi cosa.

## Tabellone pubblico (bozza B)

Contenuto, tutto su fondo `#0B1120`:

- **Riga in alto**: a sinistra nome Casa con barra verticale **blu**, a destra nome Ospite con barra **arancione**; al centro **"SET n"** (con "Tie-break" quando è il set decisivo).
- **Servizio**: icona pallone **gialla** accanto al nome della squadra che serve.
- **Centro**: i due punteggi enormi (peso 900, cifre tabulari) a sinistra e a destra; tra i due, **"SET VINTI"** con i set vinti grandi, colorati blu e arancione.
- **Fine partita**: il tabellone mostra il **risultato finale e il vincitore** (es. "Ha vinto Casa", set vinti 3–1) al posto della normale indicazione del set; i punti dell'ultimo set restano visibili (comportamento già presente nel reducer).
- **Nomi lunghi**: al massimo una riga per nome sul tabellone, con ellissi; non devono mai spingere o rimpicciolire i punteggi.
- Le proporzioni devono adattarsi a qualsiasi dimensione della finestra (dal riquadro trascinato a mano fino al 4K a schermo intero) senza scroll: le dimensioni dipendono dalla finestra (es. unità `vw`/`vh`/`vmin`), non da pixel fissi.

## Finestra del segnapunti (bozza PC 2)

- **Barra in alto**: titolo app; stato tabellone ("● Tabellone aperto" verde **oppure** pulsante "Apri tabellone"); "Chiudi tabellone" (solo se aperto); "Impostazioni"; "Nuova partita" (rosso, con conferma come oggi).
- **Centro**: l'**anteprima** = lo stesso componente del tabellone pubblico, renderizzato più piccolo dentro un riquadro con bordo sottile. Deve essere identica per contenuto e disposizione; è ciò che garantisce al segnapunti cosa vede il pubblico.
- **In basso**, tre gruppi:
  - Casa (sinistra): **+1** grande primario, **−1**, **Timeout · n rimasti**, **Servizio**.
  - Centro: **Annulla (U)** primario e **"Altre azioni…"**.
  - Ospite (destra): come Casa, speculare.
- **"Altre azioni…"** apre un piccolo menu con: **Azzera set** (con conferma), **Assegna set a Casa / a Ospite**, **Esporta report CSV** (attivo solo a partita finita). Queste azioni esistono già oggi: cambiano solo posizione.
- Restano **tutte le scorciatoie da tastiera** attuali (Q/A, P/L, W/O, 1/2, U); le etichette dei pulsanti mostrano il tasto.
- La finestra delle **Impostazioni** resta com'è (passa solo al tema scuro).
- Deve stare in una schermata senza scroll dal 1366×768 in su.

## Vincoli

- **Offline obbligatorio**: nessuna risorsa di rete (font, API). Font di sistema.
- **Tauri 2** (Windows); l'app deve continuare a funzionare anche nel browser con `npm run dev` (regola `isTauri()` + fallback; in browser il tabellone può aprirsi come nuova scheda/finestra del browser).
- Ogni nuova API Tauri richiede il permesso in `src-tauri/capabilities/default.json`, che oggi vale solo per la finestra `main`: va esteso alla nuova finestra.
- La **logica di gioco resta nel reducer** (`src/state/matchReducer.ts`); il tabellone non ha logica propria, solo visualizza lo stato.
- La **finestra del segnapunti è l'unica fonte della verità**: solo lei modifica lo stato; il tabellone legge.
- **Colori solo tramite variabili CSS** (`:root` in `src/index.css`): nessun colore scritto direttamente nei componenti, così tornare al chiaro sarà solo un cambio di valori.
- **Palette scura** (dalle bozze):

  | Ruolo | Valore |
  |---|---|
  | Fondo app | `#0B1120` |
  | Superfici (barre, pannelli) | `#111A2E` |
  | Bordi | `#1E293B` (riquadro anteprima `#334155`) |
  | Testo | `#F8FAFC` |
  | Testo secondario | `#94A3B8` / `#CBD5E1` |
  | Casa | blu `#3B82F6` |
  | Ospite | arancione `#F97316` |
  | Servizio | giallo `#FACC15` |
  | Stato attivo | verde `#4ADE80` |
  | Pericolo | rosso `rgba(239, 68, 68, …)` |

  Il blu resta anche il colore delle azioni primarie (+1, Annulla), come oggi. Contrasti da verificare con i valori finali (testo ≥ 4.5:1).
- **`DESIGN.md` va aggiornato** al tema scuro: palette sopra, arancione al posto del rosso per Ospite, giallo per il servizio, nuovo componente "tabellone pubblico", regola "solo variabili CSS". La metafora "Il Tabellone di Palestra" resta.
- Aggiornare `CLAUDE.md` (architettura) con la nuova finestra.

## Lasciato a chi costruisce

- Come sincronizzare lo stato tra le due finestre (eventi Tauri, evento `storage` di `localStorage`, `BroadcastChannel`, …), purché rispetti "aggiornamento immediato" e "il segnapunti è la fonte della verità", e funzioni sia in Tauri sia nel browser.
- Come la finestra del tabellone sa di essere il tabellone (etichetta della finestra, parametro nell'URL, rotta, …).
- Come ricordare posizione/dimensione (plugin `window-state` di Tauri o salvataggio manuale).
- Come nascondere il cursore sul tabellone (es. dopo qualche secondo di inattività).
- Struttura dei componenti, purché il tabellone pubblico e l'anteprima siano **lo stesso componente**.
- Test: logica pura con Vitest come oggi; per le finestre, verifica manuale/visiva.

## Decisioni prese da me (da verificare)

- Arancione invece di rosso per Ospite (si distingue dal blu anche per chi non vede bene i colori).
- F11 / doppio clic per lo schermo intero e memoria della posizione: proposti da me, accettati.
- Le azioni rare spostate in "Altre azioni…".
