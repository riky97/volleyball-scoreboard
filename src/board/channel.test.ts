import { describe, expect, it } from "vitest";
import { createInitialMatchState, type MatchState } from "../models/match";
import type { MatchAction } from "../state/matchReducer";
import { onAction, onMatch, onMatchRequest, publishMatch, requestMatch, sendAction } from "./channel";

function nextMessage<T>(subscribe: (cb: (value: T) => void) => () => void): Promise<T> {
    return new Promise((resolve) => {
        const stop = subscribe((value) => {
            stop();
            resolve(value);
        });
    });
}

describe("board channel (browser transport)", () => {
    it("delivers the published match state to listeners", async () => {
        const state = createInitialMatchState();
        const received = nextMessage<MatchState>(onMatch);
        publishMatch(state);
        expect(await received).toEqual(state);
    });

    it("delivers forwarded actions to the scorer", async () => {
        const action: MatchAction = { type: "point.increment", team: "away" };
        const received = nextMessage<MatchAction>(onAction);
        sendAction(action);
        expect(await received).toEqual(action);
    });

    it("delivers the board's request for the current state", async () => {
        const received = nextMessage<void>((cb) => onMatchRequest(() => cb(undefined)));
        requestMatch();
        await expect(received).resolves.toBeUndefined();
    });
});
