import type { MatchRules } from "../models/match";

type Props = {
    label: string;
    color: "home" | "away";
    rules: MatchRules;
    setsWon: number;
    currentSet: number;
};

export function SetIndicator({ label, color, rules, setsWon, currentSet }: Props) {
    const totalSets = rules.bestOf;

    return (
        <div className={`setIndicator setIndicator--${color}`}>
            <div className="setIndicator__label">{label}</div>
            <div className="setIndicator__dots" aria-label={`${label}: set vinti ${setsWon}`}>
                {Array.from({ length: totalSets }, (_, index) => {
                    const setNumber = index + 1;
                    const isWon = setNumber <= setsWon;
                    const isCurrent = setNumber === currentSet;
                    const className = ["setDot", isWon ? "setDot--won" : "setDot--empty", isCurrent ? "setDot--current" : ""]
                        .filter(Boolean)
                        .join(" ");

                    return <span key={setNumber} className={className} title={`Set ${setNumber}`} />;
                })}
            </div>
        </div>
    );
}
