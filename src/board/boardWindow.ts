import { isTauri } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export const BOARD_LABEL = "board";
const BOARD_URL = "/?view=board";

let browserBoard: Window | null = null;

/** Opens the public board window (or focuses it if already open); `onClosed` fires once when it goes away. */
export async function openBoard(onClosed: () => void): Promise<void> {
    if (isTauri()) {
        const existing = await WebviewWindow.getByLabel(BOARD_LABEL);
        if (existing) {
            // Also after a scorer reload, when the earlier listener is gone.
            void existing.once("tauri://destroyed", onClosed);
            await existing.setFocus();
            return;
        }
        const board = new WebviewWindow(BOARD_LABEL, { url: BOARD_URL, title: "Tabellone", width: 1280, height: 720 });
        void board.once("tauri://destroyed", onClosed);
        void board.once("tauri://error", onClosed);
        return;
    }

    if (browserBoard && !browserBoard.closed) {
        browserBoard.focus();
        return;
    }
    browserBoard = window.open(BOARD_URL, BOARD_LABEL, "popup,width=1280,height=720");
    if (!browserBoard) {
        onClosed();
        return;
    }
    const watched = browserBoard;
    // shortcut: polling is the only close signal a popup gives the opener; fine at 1 s for a status light.
    const timer = window.setInterval(() => {
        if (!watched.closed) return;
        window.clearInterval(timer);
        onClosed();
    }, 1000);
}

export async function closeBoard(): Promise<void> {
    if (isTauri()) {
        // Never throw: closing the app must go on even if the board is already gone.
        try {
            const board = await WebviewWindow.getByLabel(BOARD_LABEL);
            await board?.close();
        } catch {
            // nothing left to close
        }
        return;
    }
    browserBoard?.close();
}
