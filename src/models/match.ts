export type TeamSide = "home" | "away";

export type MatchStatus = "in_progress" | "finished";

export type MatchRules = {
    bestOf: 3 | 5;
    pointsToWinSet: number;
    pointsToWinTiebreak: number;
    winByTwo: boolean;
    applyAutomaticSetWin: boolean;
    timeoutsPerSet: number;
};

export type TeamState = {
    name: string;
    points: number;
    setsWon: number;
    timeoutsLeft: number;
    isServing: boolean;
};

export type SetSnapshot = {
    setNumber: number;
    homePoints: number;
    awayPoints: number;
    winner: TeamSide;
    timestamp: number;
};

export type MatchState = {
    status: MatchStatus;
    currentSet: number;
    rules: MatchRules;
    home: TeamState;
    away: TeamState;
    setHistory: SetSnapshot[];
};

export type Undoable<T> = {
    present: T;
    past: T[];
};

export const STORAGE_KEY = "volleyball-scoreboard.matchState.v1";

export function createDefaultRules(): MatchRules {
    return {
        bestOf: 5,
        pointsToWinSet: 25,
        pointsToWinTiebreak: 15,
        winByTwo: true,
        applyAutomaticSetWin: true,
        timeoutsPerSet: 2,
    };
}

export function createInitialMatchState(overrides?: Partial<MatchState>): MatchState {
    const rules = overrides?.rules ?? createDefaultRules();

    return {
        status: "in_progress",
        currentSet: 1,
        rules,
        home: {
            name: "Casa",
            points: 0,
            setsWon: 0,
            timeoutsLeft: rules.timeoutsPerSet,
            isServing: true,
        },
        away: {
            name: "Ospite",
            points: 0,
            setsWon: 0,
            timeoutsLeft: rules.timeoutsPerSet,
            isServing: false,
        },
        setHistory: [],
        ...overrides,
    };
}

export function getMaxSets(rules: MatchRules): number {
    return rules.bestOf;
}

export function getSetsToWin(rules: MatchRules): number {
    return Math.ceil(rules.bestOf / 2);
}

export function getPointsTargetForSet(rules: MatchRules, setNumber: number): number {
    const isTiebreak = setNumber >= rules.bestOf;
    return isTiebreak ? rules.pointsToWinTiebreak : rules.pointsToWinSet;
}

export function clampNonNegative(value: number): number {
    return value < 0 ? 0 : value;
}
