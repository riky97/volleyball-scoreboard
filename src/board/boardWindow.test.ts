import { beforeEach, describe, expect, it, vi } from "vitest";

const tauri = vi.hoisted(() => ({
    existing: null as null | { setFocus: ReturnType<typeof vi.fn>; once: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> },
    created: [] as { label: string; handlers: Record<string, () => void> }[],
}));

vi.mock("@tauri-apps/api/core", () => ({ isTauri: () => true }));
vi.mock("@tauri-apps/api/webviewWindow", () => ({
    WebviewWindow: class {
        handlers: Record<string, () => void> = {};
        constructor(label: string) {
            tauri.created.push({ label, handlers: this.handlers });
        }
        once(event: string, cb: () => void) {
            this.handlers[event] = cb;
            return Promise.resolve(() => {});
        }
        static getByLabel() {
            return Promise.resolve(tauri.existing);
        }
    },
}));

import { closeBoard, openBoard } from "./boardWindow";

beforeEach(() => {
    tauri.existing = null;
    tauri.created = [];
});

describe("openBoard (Tauri)", () => {
    it("reports the board closed when the window fails to be created", async () => {
        const onClosed = vi.fn();
        await openBoard(onClosed);
        tauri.created[0].handlers["tauri://error"]();
        expect(onClosed).toHaveBeenCalledOnce();
    });

    it("still tracks closing when the board window already exists", async () => {
        const onClosed = vi.fn();
        tauri.existing = { setFocus: vi.fn(), once: vi.fn(), close: vi.fn() };
        await openBoard(onClosed);
        expect(tauri.existing.setFocus).toHaveBeenCalled();
        expect(tauri.existing.once).toHaveBeenCalledWith("tauri://destroyed", onClosed);
    });
});

describe("closeBoard (Tauri)", () => {
    it("never throws, so closing the app always proceeds", async () => {
        tauri.existing = { setFocus: vi.fn(), once: vi.fn(), close: vi.fn().mockRejectedValue(new Error("gone")) };
        await expect(closeBoard()).resolves.toBeUndefined();
    });
});
