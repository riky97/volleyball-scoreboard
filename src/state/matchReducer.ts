import {
    clampNonNegative,
    createInitialMatchState,
    getMaxSets,
    getPointsTargetForSet,
    getSetsToWin,
    type MatchState,
    type TeamSide,
    type Undoable,
} from "../models/match";

export type MatchAction =
    | { type: "point.increment"; team: TeamSide }
    | { type: "point.decrement"; team: TeamSide }
    | { type: "timeout.take"; team: TeamSide }
    | { type: "serving.set"; team: TeamSide }
    | { type: "set.award"; winner: TeamSide }
    | { type: "set.reset_current" }
    | { type: "match.reset" }
    | { type: "match.rename_team"; team: TeamSide; name: string }
    | { type: "rules.update"; rules: Partial<MatchState["rules"]> }
    | { type: "undo" };

const MAX_UNDO = 200;

function setServing(state: MatchState, team: TeamSide): MatchState {
    if (team === "home") {
        return {
            ...state,
            home: { ...state.home, isServing: true },
            away: { ...state.away, isServing: false },
        };
    }

    return {
        ...state,
        home: { ...state.home, isServing: false },
        away: { ...state.away, isServing: true },
    };
}

function resetCurrentSetKeepingMeta(state: MatchState): MatchState {
    const timeouts = state.rules.timeoutsPerSet;
    return {
        ...state,
        home: { ...state.home, points: 0, timeoutsLeft: timeouts },
        away: { ...state.away, points: 0, timeoutsLeft: timeouts },
    };
}

function finishIfNeeded(state: MatchState): MatchState {
    const setsToWin = getSetsToWin(state.rules);
    const hasWinner = state.home.setsWon >= setsToWin || state.away.setsWon >= setsToWin;
    return hasWinner ? { ...state, status: "finished" } : state;
}

function awardSet(state: MatchState, winner: TeamSide): MatchState {
    if (state.status === "finished") return state;

    const maxSets = getMaxSets(state.rules);
    const nextSetNumber = Math.min(state.currentSet + 1, maxSets);

    const snapshot = {
        setNumber: state.currentSet,
        homePoints: state.home.points,
        awayPoints: state.away.points,
        winner,
        timestamp: Date.now(),
    } as const;

    const timeouts = state.rules.timeoutsPerSet;

    const next: MatchState = {
        ...state,
        currentSet: nextSetNumber,
        setHistory: [...state.setHistory, snapshot],
        home: {
            ...state.home,
            points: 0,
            setsWon: state.home.setsWon + (winner === "home" ? 1 : 0),
            timeoutsLeft: timeouts,
        },
        away: {
            ...state.away,
            points: 0,
            setsWon: state.away.setsWon + (winner === "away" ? 1 : 0),
            timeoutsLeft: timeouts,
        },
    };

    return finishIfNeeded(next);
}

function shouldAutoWinSet(state: MatchState): TeamSide | null {
    const target = getPointsTargetForSet(state.rules, state.currentSet);
    const home = state.home.points;
    const away = state.away.points;

    const diff = Math.abs(home - away);
    const winByTwoOk = !state.rules.winByTwo || diff >= 2;

    if (!winByTwoOk) return null;

    if (home >= target && home > away) return "home";
    if (away >= target && away > home) return "away";
    return null;
}

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
    switch (action.type) {
        case "point.increment": {
            if (state.status === "finished") return state;
            const nextWithPoint =
                action.team === "home"
                    ? { ...state, home: { ...state.home, points: state.home.points + 1 } }
                    : { ...state, away: { ...state.away, points: state.away.points + 1 } };

            const next = setServing(nextWithPoint, action.team);

            if (!next.rules.applyAutomaticSetWin) return next;

            const winner = shouldAutoWinSet(next);
            return winner ? awardSet(next, winner) : next;
        }

        case "point.decrement": {
            if (state.status === "finished") return state;
            return action.team === "home"
                ? { ...state, home: { ...state.home, points: clampNonNegative(state.home.points - 1) } }
                : { ...state, away: { ...state.away, points: clampNonNegative(state.away.points - 1) } };
        }

        case "timeout.take": {
            if (state.status === "finished") return state;
            if (action.team === "home") {
                if (state.home.timeoutsLeft <= 0) return state;
                return { ...state, home: { ...state.home, timeoutsLeft: state.home.timeoutsLeft - 1 } };
            }

            if (state.away.timeoutsLeft <= 0) return state;
            return { ...state, away: { ...state.away, timeoutsLeft: state.away.timeoutsLeft - 1 } };
        }

        case "serving.set":
            return setServing(state, action.team);

        case "set.award":
            return awardSet(state, action.winner);

        case "set.reset_current":
            return resetCurrentSetKeepingMeta(state);

        case "match.rename_team": {
            const name = action.name.trim() || (action.team === "home" ? "Casa" : "Ospite");
            return action.team === "home" ? { ...state, home: { ...state.home, name } } : { ...state, away: { ...state.away, name } };
        }

        case "rules.update": {
            const rules = { ...state.rules, ...action.rules };
            const maxSets = getMaxSets(rules);
            const currentSet = Math.min(state.currentSet, maxSets);
            const timeouts = rules.timeoutsPerSet;

            return {
                ...state,
                currentSet,
                rules,
                home: {
                    ...state.home,
                    timeoutsLeft: Math.min(state.home.timeoutsLeft, timeouts),
                },
                away: {
                    ...state.away,
                    timeoutsLeft: Math.min(state.away.timeoutsLeft, timeouts),
                },
            };
        }

        case "match.reset": {
            const next = createInitialMatchState({
                rules: state.rules,
                home: { ...state.home, points: 0, setsWon: 0, timeoutsLeft: state.rules.timeoutsPerSet },
                away: { ...state.away, points: 0, setsWon: 0, timeoutsLeft: state.rules.timeoutsPerSet },
            });

            return {
                ...next,
                home: { ...next.home, name: state.home.name, isServing: state.home.isServing },
                away: { ...next.away, name: state.away.name, isServing: state.away.isServing },
            };
        }

        case "undo":
            return state;

        default:
            return state;
    }
}

export function createInitialUndoableState(initial?: MatchState): Undoable<MatchState> {
    return {
        present: initial ?? createInitialMatchState(),
        past: [],
    };
}

export function undoableMatchReducer(state: Undoable<MatchState>, action: MatchAction): Undoable<MatchState> {
    if (action.type === "undo") {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
            present: previous,
            past: state.past.slice(0, -1),
        };
    }

    const nextPresent = matchReducer(state.present, action);
    if (nextPresent === state.present) return state;

    return {
        present: nextPresent,
        past: [...state.past, state.present].slice(-MAX_UNDO),
    };
}
