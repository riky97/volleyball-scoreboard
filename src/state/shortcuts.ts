import type { MatchAction } from "./matchReducer";

type ShortcutKey = { key: string; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean };

const SHORTCUTS: Record<string, MatchAction> = {
    q: { type: "point.increment", team: "home" },
    a: { type: "point.decrement", team: "home" },
    p: { type: "point.increment", team: "away" },
    l: { type: "point.decrement", team: "away" },
    w: { type: "timeout.take", team: "home" },
    o: { type: "timeout.take", team: "away" },
    "1": { type: "serving.set", team: "home" },
    "2": { type: "serving.set", team: "away" },
    u: { type: "undo" },
};

/** Keys typed in form fields (including selects) are text, never match actions. */
export function isEditableTarget(target: EventTarget | null): boolean {
    if (!target || !("tagName" in target)) return false;
    const el = target as HTMLElement;
    const tag = el.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
}

export function shortcutAction(e: ShortcutKey): MatchAction | null {
    if (e.ctrlKey || e.altKey || e.metaKey) return null;
    return SHORTCUTS[e.key.toLowerCase()] ?? null;
}
