import { describe, expect, it } from "vitest";
import { isEditableTarget, shortcutAction } from "./shortcuts";

describe("shortcutAction", () => {
    it("maps the scorer keys to match actions, case-insensitively", () => {
        expect(shortcutAction({ key: "q" })).toEqual({ type: "point.increment", team: "home" });
        expect(shortcutAction({ key: "Q" })).toEqual({ type: "point.increment", team: "home" });
        expect(shortcutAction({ key: "l" })).toEqual({ type: "point.decrement", team: "away" });
        expect(shortcutAction({ key: "2" })).toEqual({ type: "serving.set", team: "away" });
        expect(shortcutAction({ key: "u" })).toEqual({ type: "undo" });
    });

    it("ignores keys pressed with a modifier", () => {
        expect(shortcutAction({ key: "q", ctrlKey: true })).toBeNull();
        expect(shortcutAction({ key: "p", altKey: true })).toBeNull();
        expect(shortcutAction({ key: "u", metaKey: true })).toBeNull();
    });

    it("ignores keys without a shortcut", () => {
        expect(shortcutAction({ key: "x" })).toBeNull();
    });
});

describe("isEditableTarget", () => {
    it("treats text fields and selects as editable, so their keys never score", () => {
        expect(isEditableTarget({ tagName: "INPUT" } as unknown as EventTarget)).toBe(true);
        expect(isEditableTarget({ tagName: "SELECT" } as unknown as EventTarget)).toBe(true);
        expect(isEditableTarget({ tagName: "TEXTAREA" } as unknown as EventTarget)).toBe(true);
        expect(isEditableTarget({ tagName: "BUTTON" } as unknown as EventTarget)).toBe(false);
        expect(isEditableTarget(null)).toBe(false);
    });
});
