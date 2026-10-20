import { getWinner, type MatchState, type TeamSide, type TeamState } from "../models/match";

function ServeBall() {
    return (
        <svg className="board__serve" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" role="img" aria-label="Al servizio">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20M2.5 9.5c5 1 10 0 14-4M4 17c4-3 10-4 16-2" />
        </svg>
    );
}

function BoardTeam({ side, team, finished, isWinner }: { side: TeamSide; team: TeamState; finished: boolean; isWinner: boolean }) {
    return (
        <div className={`board__team board__team--${side}`}>
            <span className="board__bar" aria-hidden="true" />
            <div className="board__teamText">
                <div className="board__name" title={team.name}>
                    {team.name}
                </div>
                {isWinner ? <div className="board__winner">Vincitore</div> : <div className="board__timeouts">Timeout {team.timeoutsLeft}</div>}
            </div>
            {team.isServing && !finished ? <ServeBall /> : null}
        </div>
    );
}

/** Public scoreboard. Fills its parent; sizes follow the container, so the same component is the TV view and the preview. */
export function Scoreboard({ match }: { match: MatchState }) {
    const winner = getWinner(match);
    const isTiebreak = match.currentSet >= match.rules.bestOf;
    const status = winner ? "FINE PARTITA" : `SET ${match.currentSet}${isTiebreak ? " · Tie-break" : ""}`;

    return (
        <section className="board" aria-label="Tabellone">
            <header className="board__top">
                <BoardTeam side="home" team={match.home} finished={winner !== null} isWinner={winner === "home"} />
                <div className={winner ? "board__status board__status--final" : "board__status"}>{status}</div>
                <BoardTeam side="away" team={match.away} finished={winner !== null} isWinner={winner === "away"} />
            </header>

            <div className="board__main">
                <div className="board__points" aria-label={`Punti ${match.home.name}`}>
                    {match.home.points}
                </div>
                <div className="board__sets">
                    <div className="board__setsLabel">SET VINTI</div>
                    <div className="board__setsValue">
                        <span className="board__setsHome">{match.home.setsWon}</span>
                        <span className="board__setsDash">–</span>
                        <span className="board__setsAway">{match.away.setsWon}</span>
                    </div>
                </div>
                <div className="board__points" aria-label={`Punti ${match.away.name}`}>
                    {match.away.points}
                </div>
            </div>
        </section>
    );
}
