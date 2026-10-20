import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createInitialMatchState, getPointsTargetForSet, type TeamSide } from "../models/match";
import { clearMatchState, loadMatchState, saveMatchState } from "../state/persistence";
import { createInitialUndoableState, type MatchAction, undoableMatchReducer } from "../state/matchReducer";
import { SettingsModal } from "./SettingsModal";
import { Scoreboard } from "./Scoreboard";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { confirm, message, save } from "@tauri-apps/plugin-dialog";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { buildMatchReportCsv } from "../utils/matchReportCsv";
import { shortcutAction } from "../state/shortcuts";
import { onAction, onMatchRequest, publishMatch } from "../board/channel";
import { closeBoard, openBoard } from "../board/boardWindow";

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
    const [isExporting, setIsExporting] = useState(false);
    const [boardOpen, setBoardOpen] = useState(false);

    const pointsTarget = useMemo(() => getPointsTargetForSet(match.rules, match.currentSet), [match.currentSet, match.rules]);


    const allowCloseRef = useRef(false);

    const isTiebreak = match.currentSet >= match.rules.bestOf;

    // The scorer is the single source of truth: publish every change at once, answer the board's requests, apply its forwarded keys.
    const matchRef = useRef(match);
    useEffect(() => {
        matchRef.current = match;
        publishMatch(match);
    }, [match]);

    useEffect(() => {
        const stopRequests = onMatchRequest(() => publishMatch(matchRef.current));
        const stopActions = onAction(dispatch);
        return () => {
            stopRequests();
            stopActions();
        };
    }, []);

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

            const action = shortcutAction(e);
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

                await closeBoard();
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

    function buildDefaultCsvFileName(): string {
        const safe = (s: string) =>
            s
                .trim()
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9_-]+/g, "")
                .slice(0, 40) || "team";
        const date = new Date();
        const yyyy = String(date.getFullYear());
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `report_${safe(match.home.name)}_vs_${safe(match.away.name)}_${yyyy}-${mm}-${dd}.csv`;
    }

    async function exportCsvReport() {
        if (match.status !== "finished") return;
        if (isExporting) return;

        setIsExporting(true);
        try {
            const csv = buildMatchReportCsv(match);

            if (isTauri()) {
                const selected = await save({
                    title: "Salva report CSV",
                    defaultPath: buildDefaultCsvFileName(),
                    filters: [{ name: "CSV", extensions: ["csv"] }],
                });

                if (!selected) return;

                const path = selected.toLowerCase().endsWith(".csv") ? selected : `${selected}.csv`;
                await invoke("write_text_file", { path, contents: csv });
                await message("Report salvato correttamente.", { title: "Esportazione CSV", kind: "info" });
                return;
            }

            // Browser fallback (preview / web build)
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = buildDefaultCsvFileName();
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            const text = e instanceof Error ? e.message : String(e);
            if (isTauri()) {
                await message(`Errore durante il salvataggio: ${text}`, { title: "Esportazione CSV", kind: "error" });
            } else {
                window.alert(`Errore durante il salvataggio: ${text}`);
            }
        } finally {
            setIsExporting(false);
        }
    }

    // Closes the "Altre azioni…" menu after picking an entry.
    function closeMenu(e: React.MouseEvent<HTMLElement>) {
        e.currentTarget.closest("details")?.removeAttribute("open");
    }

    function teamControls(team: TeamSide, keys: { plus: string; minus: string; timeout: string; serve: string }) {
        const t = match[team];
        return (
            <div className={`controls__team controls__team--${team}`} aria-label={`Controlli ${t.name}`}>
                <button className="btn btn--primary" onClick={() => dispatch({ type: "point.increment", team })}>
                    +1 ({keys.plus})
                </button>
                <button className="btn btn--ghost" onClick={() => dispatch({ type: "point.decrement", team })}>
                    −1 ({keys.minus})
                </button>
                <button className="btn btn--ghost" onClick={() => dispatch({ type: "timeout.take", team })} disabled={t.timeoutsLeft <= 0}>
                    Timeout · {t.timeoutsLeft} ({keys.timeout})
                </button>
                <button className="btn btn--ghost" onClick={() => dispatch({ type: "serving.set", team })}>
                    Servizio ({keys.serve})
                </button>
            </div>
        );
    }

    return (
        <div className="page">
            <header className="topBar">
                <div className="topBar__left">
                    <div className="appTitle">Segnapunti Pallavolo</div>
                    <div className="appSubTitle">
                        {formatStatusLabel(match.status)} · Obiettivo {pointsTarget}
                        {isTiebreak ? " (tie-break)" : ""}
                    </div>
                </div>

                <div className="topBar__right">
                    {boardOpen ? (
                        <>
                            <span className="liveBadge" role="status">
                                Tabellone aperto
                            </span>
                            <button className="btn btn--ghost" onClick={() => void closeBoard()}>
                                Chiudi tabellone
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn--primary"
                            onClick={() => {
                                setBoardOpen(true);
                                void openBoard(() => setBoardOpen(false));
                            }}
                        >
                            Apri tabellone
                        </button>
                    )}
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

            <main className="preview" aria-label="Anteprima del tabellone">
                <div className="preview__frame">
                    <Scoreboard match={match} />
                </div>
            </main>

            <section className="controls" aria-label="Controlli punti">
                {teamControls("home", { plus: "Q", minus: "A", timeout: "W", serve: "1" })}

                <div className="controls__center">
                    <button className="btn btn--primary" onClick={() => dispatch({ type: "undo" })}>
                        Annulla (U)
                    </button>
                    <details className="moreMenu">
                        <summary className="btn btn--ghost">Altre azioni…</summary>
                        <div className="moreMenu__list">
                            <button
                                className="btn btn--ghost"
                                onClick={(e) => {
                                    closeMenu(e);
                                    void confirmAndDispatch({ type: "set.reset_current" }, "Vuoi azzerare il set corrente?");
                                }}
                            >
                                Azzera set
                            </button>
                            {match.status !== "finished" ? (
                                <>
                                    <button className="btn btn--ghost" title={`Assegna set a ${match.home.name}`} onClick={(e) => (closeMenu(e), awardSetTo("home"))}>
                                        Assegna set a {match.home.name}
                                    </button>
                                    <button className="btn btn--ghost" title={`Assegna set a ${match.away.name}`} onClick={(e) => (closeMenu(e), awardSetTo("away"))}>
                                        Assegna set a {match.away.name}
                                    </button>
                                </>
                            ) : null}
                            <button
                                className="btn btn--ghost"
                                disabled={match.status !== "finished" || isExporting}
                                title={match.status === "finished" ? "Esporta report CSV" : "Esporta report CSV (disponibile a fine partita)"}
                                onClick={(e) => {
                                    closeMenu(e);
                                    void exportCsvReport();
                                }}
                            >
                                Esporta report CSV
                            </button>
                        </div>
                    </details>
                </div>

                {teamControls("away", { plus: "P", minus: "L", timeout: "O", serve: "2" })}
            </section>

            {settingsOpen && (
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
            )}
        </div>
    );
}
