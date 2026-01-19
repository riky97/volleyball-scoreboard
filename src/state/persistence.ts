import { STORAGE_KEY, type MatchState } from "../models/match";

export function loadMatchState(): MatchState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object") return null;

        const candidate = parsed as Partial<MatchState>;
        if (candidate.currentSet == null || candidate.rules == null) return null;
        if (!candidate.home || !candidate.away) return null;

        return candidate as MatchState;
    } catch {
        return null;
    }
}

export function saveMatchState(state: MatchState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore persistence errors
    }
}

export function clearMatchState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}
