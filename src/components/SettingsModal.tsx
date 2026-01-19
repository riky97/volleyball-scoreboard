import { useEffect, useMemo, useState } from "react";
import type { MatchRules, TeamState } from "../models/match";

type Draft = {
    homeName: string;
    awayName: string;
    bestOf: 3 | 5;
    pointsToWinSet: number;
    pointsToWinTiebreak: number;
    winByTwo: boolean;
    applyAutomaticSetWin: boolean;
    timeoutsPerSet: number;
};

type Props = {
    open: boolean;
    home: TeamState;
    away: TeamState;
    rules: MatchRules;
    onClose: () => void;
    onApply: (draft: Draft) => void;
};

function coerceBestOf(value: string): 3 | 5 {
    return value === "3" ? 3 : 5;
}

function coercePositiveInt(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function SettingsModal({ open, home, away, rules, onClose, onApply }: Props) {
    const initialDraft = useMemo<Draft>(
        () => ({
            homeName: home.name,
            awayName: away.name,
            bestOf: rules.bestOf,
            pointsToWinSet: rules.pointsToWinSet,
            pointsToWinTiebreak: rules.pointsToWinTiebreak,
            winByTwo: rules.winByTwo,
            applyAutomaticSetWin: rules.applyAutomaticSetWin,
            timeoutsPerSet: rules.timeoutsPerSet,
        }),
        [away.name, home.name, rules],
    );

    const [draft, setDraft] = useState<Draft>(initialDraft);

    useEffect(() => {
        if (open) setDraft(initialDraft);
    }, [initialDraft, open]);

    if (!open) return null;

    return (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Impostazioni">
            <div className="modal">
                <header className="modal__header">
                    <h3 className="modal__title">Impostazioni</h3>
                    <button className="btn btn--ghost" onClick={onClose}>
                        Chiudi
                    </button>
                </header>

                <div className="modal__content">
                    <div className="formGrid">
                        <label className="field">
                            <span className="field__label">Nome squadra Casa</span>
                            <input
                                value={draft.homeName}
                                onChange={(e) => setDraft((d) => ({ ...d, homeName: e.target.value }))}
                                placeholder="Casa"
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Nome squadra Ospite</span>
                            <input
                                value={draft.awayName}
                                onChange={(e) => setDraft((d) => ({ ...d, awayName: e.target.value }))}
                                placeholder="Ospite"
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Formula</span>
                            <select value={String(draft.bestOf)} onChange={(e) => setDraft((d) => ({ ...d, bestOf: coerceBestOf(e.target.value) }))}>
                                <option value="5">Al meglio dei 5 set</option>
                                <option value="3">Al meglio dei 3 set</option>
                            </select>
                        </label>

                        <label className="field">
                            <span className="field__label">Punti per vincere set (1–4)</span>
                            <input
                                inputMode="numeric"
                                value={String(draft.pointsToWinSet)}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        pointsToWinSet: coercePositiveInt(e.target.value, d.pointsToWinSet),
                                    }))
                                }
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Punti per vincere tie-break</span>
                            <input
                                inputMode="numeric"
                                value={String(draft.pointsToWinTiebreak)}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        pointsToWinTiebreak: coercePositiveInt(e.target.value, d.pointsToWinTiebreak),
                                    }))
                                }
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Timeout per set</span>
                            <input
                                inputMode="numeric"
                                value={String(draft.timeoutsPerSet)}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        timeoutsPerSet: coercePositiveInt(e.target.value, d.timeoutsPerSet),
                                    }))
                                }
                            />
                        </label>

                        <label className="field field--inline">
                            <input
                                type="checkbox"
                                checked={draft.winByTwo}
                                onChange={(e) => setDraft((d) => ({ ...d, winByTwo: e.target.checked }))}
                            />
                            <span className="field__label">Vantaggio di 2</span>
                        </label>

                        <label className="field field--inline">
                            <input
                                type="checkbox"
                                checked={draft.applyAutomaticSetWin}
                                onChange={(e) => setDraft((d) => ({ ...d, applyAutomaticSetWin: e.target.checked }))}
                            />
                            <span className="field__label">Assegna set automaticamente</span>
                        </label>
                    </div>
                </div>

                <footer className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>
                        Annulla
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={() => {
                            onApply(draft);
                            onClose();
                        }}
                    >
                        Salva
                    </button>
                </footer>
            </div>
        </div>
    );
}
