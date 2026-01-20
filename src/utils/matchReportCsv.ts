import type { MatchState, TeamSide } from "../models/match";

function escapeCsvCell(value: string): string {
    // RFC4180-ish: quote when needed, double quotes inside.
    const mustQuote = /[",\n\r]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return mustQuote ? `"${escaped}"` : escaped;
}

function winnerLabel(winner: TeamSide): string {
    return winner === "home" ? "Casa" : "Ospite";
}

export function buildMatchReportCsv(match: MatchState): string {
    const homeTeam = match.home.name;
    const awayTeam = match.away.name;

    const rows: string[][] = [];

    // Repeat match-level metadata on each set row (easy to pivot/filter in Excel).
    rows.push([
        "Numero set",
        "Team Casa",
        "Team Ospite",
        "Punti Casa",
        "Punti Ospite",
        "Vincitore",
        "Set vinti Casa",
        "Set vinti Ospite",
        "Stato Match",
        "Durata Set (minuti)",
    ]);

    for (const set of match.setHistory) {
        const setEndTimestamp = set.timestamp;
        const previousSetEndTimestamp = set.setNumber > 1 ? match.setHistory[set.setNumber - 2].timestamp : null;
        const durationMs = previousSetEndTimestamp ? setEndTimestamp - previousSetEndTimestamp : 0;
        const durationStr = previousSetEndTimestamp ? String(Math.round(durationMs / 60000)) : "N/A";
        rows.push([
            String(set.setNumber),
            homeTeam,
            awayTeam,
            String(set.homePoints),
            String(set.awayPoints),
            winnerLabel(set.winner),
            String(match.home.setsWon),
            String(match.away.setsWon),
            match.status,
            durationStr,
        ]);
    }

    return rows.map((r) => r.map((c) => escapeCsvCell(c)).join(",")).join("\r\n") + "\r\n";
}
