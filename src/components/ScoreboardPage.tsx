import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createInitialMatchState, getPointsTargetForSet, getSetsToWin, type TeamSide } from "../models/match";
import { clearMatchState, loadMatchState, saveMatchState } from "../state/persistence";
import { createInitialUndoableState, type MatchAction, undoableMatchReducer } from "../state/matchReducer";
import { SetIndicator } from "./SetIndicator";
import { SettingsModal } from "./SettingsModal";
import { TeamPanel } from "./TeamPanel";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
import { isTauri } from "@tauri-apps/api/core";

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || target.isContentEditable;
}

function formatStatusLabel(status: "in_progress" | "finished"): string {
    return status === "finished" ? "Partita terminata" : "Partita in corso";
}

export function ScoreboardPage() {
    const loaded = useMemo(() => loadMatchState(), []);
    const initialState = useMemo(() => createInitialUndoableState(loaded ?? createInitialMatchState()), [loaded]);

    const [state, dispatch] = useReducer(undoableMatchReducer, initialState);
    const match = state.present;

    const [settingsOpen, setSettingsOpen] = useState(false);

    const pointsTarget = useMemo(() => getPointsTargetForSet(match.rules, match.currentSet), [match.currentSet, match.rules]);

    const setsToWin = useMemo(() => getSetsToWin(match.rules), [match.rules]);

    const allowCloseRef = useRef(false);

    const isTiebreak = match.currentSet >= match.rules.bestOf;

    useEffect(() => {
        const handle = window.setTimeout(() => {
            saveMatchState(match);
        }, 150);

        return () => window.clearTimeout(handle);
    }, [match]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return;
            if (isEditableTarget(e.target)) return;

            const key = e.key.toLowerCase();

            const map: Record<string, MatchAction> = {
                q: { type: "point.increment", team: "home" },
                a: { type: "point.decrement", team: "home" },
                p: { type: "point.increment", team: "away" },
                l: { type: "point.decrement", team: "away" },
                w: { type: "timeout.take", team: "home" },
                o: { type: "timeout.take", team: "away" },
                "1": { type: "serving.set", team: "home" },
                "2": { type: "serving.set", team: "away" },
                u: { type: "undo" },
            };

            const action = map[key];
            if (!action) return;

            e.preventDefault();
            dispatch(action);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!isTauri()) return;

        const appWindow = getCurrentWindow();

        let unlisten: null | (() => void) = null;

        (async () => {
            unlisten = await appWindow.onCloseRequested(async (event) => {
                // Se l'utente ha già confermato, lascia chiudere senza bloccare.
                if (allowCloseRef.current) return;

                // Blocca la chiusura finché non confermi
                event.preventDefault();

                const ok = await confirm("Vuoi davvero chiudere l'applicazione?", {
                    title: "Conferma chiusura",
                    kind: "warning",
                    okLabel: "Chiudi",
                    cancelLabel: "Annulla",
                });

                if (!ok) return;

                // Evita loop: consenti la chiusura e rimuovi il listener prima di chiudere.
                allowCloseRef.current = true;
                if (unlisten) unlisten();

                await appWindow.close();
            });
        })();

        return () => {
            if (unlisten) unlisten();
        };
    }, []);

    async function confirmAndDispatch(action: MatchAction, message: string) {
        const ok = isTauri()
            ? await confirm(message, {
                  title: "Conferma",
                  kind: "warning",
                  okLabel: "Conferma",
                  cancelLabel: "Annulla",
              })
            : window.confirm(message);

        if (!ok) return;
        dispatch(action);
    }

    function awardSetTo(team: TeamSide) {
        dispatch({ type: "set.award", winner: team });
    }

    return (
        <div className="page">
            <header className="topBar">
                <div className="topBar__left">
                    <div className="appTitle">Segnapunti Pallavolo</div>
                    <div className="appSubTitle">{formatStatusLabel(match.status)}</div>
                </div>

                <div className="topBar__center">
                    <div className="chip" title="Set corrente">
                        SET {match.currentSet}
                    </div>
                    <div className="chip chip--muted" title="Obiettivo punti set">
                        Obiettivo: {pointsTarget}
                        {isTiebreak ? " (Tie-break)" : ""}
                    </div>
                    <div className="chip chip--muted" title="Set necessari per vincere">
                        Vince a {setsToWin}
                    </div>
                </div>

                <div className="topBar__right">
                    <button className="btn btn--ghost" onClick={() => setSettingsOpen(true)}>
                        Impostazioni
                    </button>
                    <button
                        className="btn btn--danger"
                        onClick={async () => {
                            const ok = isTauri()
                                ? await confirm("Vuoi iniziare una nuova partita?", {
                                      title: "Conferma",
                                      kind: "warning",
                                      okLabel: "Nuova partita",
                                      cancelLabel: "Annulla",
                                  })
                                : window.confirm("Vuoi iniziare una nuova partita?");

                            if (!ok) return;
                            clearMatchState();
                            dispatch({ type: "match.reset" });
                        }}
                    >
                        Nuova partita
                    </button>
                </div>
            </header>

            <section className="setRow" aria-label="Set">
                <SetIndicator label={match.home.name} color="home" rules={match.rules} setsWon={match.home.setsWon} currentSet={match.currentSet} />
                <div className="setRow__center">
                    <div className="setRow__big">
                        {match.home.setsWon} - {match.away.setsWon}
                    </div>
                    <div className="setRow__small">Set vinti</div>
                </div>
                <SetIndicator label={match.away.name} color="away" rules={match.rules} setsWon={match.away.setsWon} currentSet={match.currentSet} />
            </section>

            <main className="scoreGrid">
                <TeamPanel side="home" team={match.home} />

                <section className="centerPanel" aria-label="Info set">
                    <div className="centerPanel__title">
                        Set {match.currentSet}
                        {isTiebreak ? " (Tie-break)" : ""}
                    </div>
                    <div className="centerPanel__subtitle">
                        Punti per vincere: {pointsTarget}
                        {match.rules.winByTwo ? ", vantaggio di 2" : ""}
                    </div>

                    <div className="centerPanel__actions">
                        <button className="btn btn--primary" onClick={() => dispatch({ type: "undo" })}>
                            Annulla
                        </button>
                        <button
                            className="btn btn--ghost"
                            onClick={() => void confirmAndDispatch({ type: "set.reset_current" }, "Vuoi azzerare il set corrente?")}
                        >
                            Azzeramento set
                        </button>
                    </div>

                    {match.status === "finished" ? (
                        <div className="winnerBanner" role="status">
                            {match.home.setsWon > match.away.setsWon ? `Ha vinto ${match.home.name}` : `Ha vinto ${match.away.name}`}
                        </div>
                    ) : null}

                    <div className="manualSet">
                        <div className="manualSet__label">Assegna set (manuale)</div>
                        <div className="manualSet__buttons">
                            <button className="btn btn--ghost" onClick={() => awardSetTo("home")}>
                                Set {match.home.name}
                            </button>
                            <button className="btn btn--ghost" onClick={() => awardSetTo("away")}>
                                Set {match.away.name}
                            </button>
                        </div>
                    </div>

                    <div className="hintBox">
                        <div className="hintBox__title">Scorciatoie</div>
                        <div className="hintBox__body">
                            Q/A: +/− {match.home.name} • P/L: +/− {match.away.name} • W/O: timeout • 1/2: servizio • U: annulla
                        </div>
                    </div>
                </section>

                <TeamPanel side="away" team={match.away} />
            </main>

            <section className="controls" aria-label="Controlli punti">
                <div className="controls__col controls__col--home">
                    <div className="controls__title">{match.home.name}</div>
                    <div className="controls__buttons">
                        <button className="btn btn--primary" onClick={() => dispatch({ type: "point.increment", team: "home" })}>
                            +1
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "point.decrement", team: "home" })}>
                            −1
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "timeout.take", team: "home" })}>
                            Timeout
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "serving.set", team: "home" })}>
                            Servizio
                        </button>
                    </div>
                </div>

                <div className="controls__col controls__col--away">
                    <div className="controls__title">{match.away.name}</div>
                    <div className="controls__buttons">
                        <button className="btn btn--primary" onClick={() => dispatch({ type: "point.increment", team: "away" })}>
                            +1
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "point.decrement", team: "away" })}>
                            −1
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "timeout.take", team: "away" })}>
                            Timeout
                        </button>
                        <button className="btn btn--ghost" onClick={() => dispatch({ type: "serving.set", team: "away" })}>
                            Servizio
                        </button>
                    </div>
                </div>
            </section>

            <footer className="statusBar" aria-label="Barra di stato">
                <div className="statusBar__left">
                    <span>{formatStatusLabel(match.status)}</span>
                    <span>•</span>
                    <span>
                        Set {match.currentSet} — Obiettivo {pointsTarget}
                        {isTiebreak ? " (Tie-break)" : ""}
                    </span>
                </div>
                <div className="statusBar__right">
                    <span>Scorciatoie: Q/A Casa • P/L Ospite • W/O Timeout • 1/2 Servizio • U Annulla</span>
                </div>
            </footer>

            <SettingsModal
                open={settingsOpen}
                home={match.home}
                away={match.away}
                rules={match.rules}
                onClose={() => setSettingsOpen(false)}
                onApply={(draft) => {
                    dispatch({ type: "match.rename_team", team: "home", name: draft.homeName });
                    dispatch({ type: "match.rename_team", team: "away", name: draft.awayName });
                    dispatch({
                        type: "rules.update",
                        rules: {
                            bestOf: draft.bestOf,
                            pointsToWinSet: draft.pointsToWinSet,
                            pointsToWinTiebreak: draft.pointsToWinTiebreak,
                            winByTwo: draft.winByTwo,
                            applyAutomaticSetWin: draft.applyAutomaticSetWin,
                            timeoutsPerSet: draft.timeoutsPerSet,
                        },
                    });
                }}
            />
        </div>
    );
}
