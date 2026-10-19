import { describe, expect, it } from "vitest";
import { createInitialMatchState, type MatchState } from "../models/match";
import { createInitialUndoableState, matchReducer, undoableMatchReducer, type MatchAction } from "./matchReducer";

function play(state: MatchState, actions: MatchAction[]): MatchState {
    return actions.reduce(matchReducer, state);
}

function points(team: "home" | "away", n: number): MatchAction[] {
    return Array.from({ length: n }, () => ({ type: "point.increment", team }) as const);
}

describe("matchReducer", () => {
    it("awards the set at 25 and resets points", () => {
        const s = play(createInitialMatchState(), points("home", 25));
        expect(s.home.setsWon).toBe(1);
        expect(s.currentSet).toBe(2);
        expect(s.home.points).toBe(0);
        expect(s.setHistory).toHaveLength(1);
    });

    it("requires a two-point lead", () => {
        const s = play(createInitialMatchState(), [...points("home", 24), ...points("away", 24), ...points("home", 1)]);
        expect(s.home.setsWon).toBe(0);
        expect(s.home.points).toBe(25);
    });

    it("plays the tie-break to 15 and finishes the match", () => {
        let s = createInitialMatchState();
        s = play(s, [...points("home", 25), ...points("home", 25), ...points("away", 25), ...points("away", 25)]);
        expect(s.currentSet).toBe(5);
        s = play(s, points("home", 15));
        expect(s.status).toBe("finished");
        expect(s.home.setsWon).toBe(3);
    });

    it("does not go below zero timeouts", () => {
        const s = play(createInitialMatchState(), Array(3).fill({ type: "timeout.take", team: "away" }));
        expect(s.away.timeoutsLeft).toBe(0);
    });
});

describe("undoableMatchReducer", () => {
    it("undoes the last action", () => {
        let s = createInitialUndoableState();
        s = undoableMatchReducer(s, { type: "point.increment", team: "away" });
        s = undoableMatchReducer(s, { type: "undo" });
        expect(s.present.away.points).toBe(0);
        expect(s.past).toHaveLength(0);
    });
});
