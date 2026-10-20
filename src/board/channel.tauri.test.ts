import { describe, expect, it, vi } from "vitest";

const listened = vi.hoisted(() => ({ resolve: null as null | ((stop: () => void) => void) }));

vi.mock("@tauri-apps/api/core", () => ({ isTauri: () => true }));
vi.mock("@tauri-apps/api/event", () => ({
    emit: vi.fn(() => Promise.resolve()),
    listen: vi.fn(() => new Promise((resolve) => (listened.resolve = resolve))),
}));

import { onMatch } from "./channel";

describe("board channel (Tauri transport)", () => {
    it("signals ready only once the listener is registered, so the board's state request cannot be answered too early", async () => {
        const onReady = vi.fn();
        onMatch(() => {}, onReady);
        await Promise.resolve();
        expect(onReady).not.toHaveBeenCalled();
        listened.resolve!(() => {});
        await vi.waitFor(() => expect(onReady).toHaveBeenCalledOnce());
    });
});
