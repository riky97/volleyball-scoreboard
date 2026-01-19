import type { TeamState } from "../models/match";

type Props = {
    side: "home" | "away";
    team: TeamState;
};

export function TeamPanel({ side, team }: Props) {
    return (
        <section className={`teamPanel teamPanel--${side}`} aria-label={`Squadra ${team.name}`}>
            <header className="teamPanel__header">
                <div className="teamPanel__nameRow">
                    <h2 className="teamPanel__name">{team.name}</h2>
                    {team.isServing ? <span className="badge badge--serve">Servizio</span> : null}
                </div>
                <div className="teamPanel__meta">
                    <span className="metaChip" title="Timeout rimanenti">
                        Timeout: {team.timeoutsLeft}
                    </span>
                </div>
            </header>

            <div className="teamPanel__score" aria-label={`Punti ${team.points}`}>
                <span className="teamPanel__points">{team.points}</span>
            </div>
        </section>
    );
}
