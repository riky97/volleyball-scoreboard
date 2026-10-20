import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { onMatch, requestMatch, sendAction } from "../board/channel";
import { loadMatchState } from "../state/persistence";
import { shortcutAction } from "../state/shortcuts";
import { Scoreboard } from "./Scoreboard";

async function toggleFullscreen(): Promise<void> {
    if (isTauri()) {
        const win = getCurrentWindow();
        await win.setFullscreen(!(await win.isFullscreen()));
        return;
    }
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
}

/** The public board window: shows only the Scoreboard and forwards the scorer's shortcuts. It never changes the match itself. */
export function BoardWindow() {
    const [match, setMatch] = useState(loadMatchState);

    useEffect(() => {
        const stop = onMatch(setMatch);
        requestMatch();
        return stop;
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F11") {
                e.preventDefault();
                void toggleFullscreen();
                return;
            }
            const action = shortcutAction(e);
            if (!action) return;
            e.preventDefault();
            sendAction(action);
        };
        const onDoubleClick = () => void toggleFullscreen();

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("dblclick", onDoubleClick);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("dblclick", onDoubleClick);
        };
    }, []);

    return (
        <div className="boardWindow">
            {match ? <Scoreboard match={match} /> : <div className="boardWindow__waiting">In attesa del segnapunti…</div>}
        </div>
    );
}
