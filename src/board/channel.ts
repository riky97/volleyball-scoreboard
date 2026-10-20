import { isTauri } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import type { MatchState } from "../models/match";
import type { MatchAction } from "../state/matchReducer";

// Scorer window ⇄ board window. Tauri events between native windows, BroadcastChannel in the browser (npm run dev).
const CHANNEL = "volleyball-scoreboard";
const MATCH = "match:state";
const HELLO = "board:hello";
const ACTION = "board:action";

let outbox: BroadcastChannel | null = null;

function post(type: string, payload?: unknown): void {
    if (isTauri()) {
        void emit(type, payload);
        return;
    }
    outbox ??= new BroadcastChannel(CHANNEL);
    outbox.postMessage({ type, payload });
}

function subscribe<T>(type: string, cb: (payload: T) => void): () => void {
    if (isTauri()) {
        const unlisten = listen<T>(type, (event) => cb(event.payload));
        return () => void unlisten.then((stop) => stop());
    }
    const inbox = new BroadcastChannel(CHANNEL);
    inbox.onmessage = (event: MessageEvent<{ type: string; payload: T }>) => {
        if (event.data.type === type) cb(event.data.payload);
    };
    return () => inbox.close();
}

export const publishMatch = (state: MatchState): void => post(MATCH, state);
export const onMatch = (cb: (state: MatchState) => void): (() => void) => subscribe(MATCH, cb);
export const requestMatch = (): void => post(HELLO);
export const onMatchRequest = (cb: () => void): (() => void) => subscribe(HELLO, () => cb());
export const sendAction = (action: MatchAction): void => post(ACTION, action);
export const onAction = (cb: (action: MatchAction) => void): (() => void) => subscribe(ACTION, cb);
