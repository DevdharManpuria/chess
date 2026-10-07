import { useEffect, useState } from "react";
import { Button } from "./Button";

export type GameResult = {
    winner: "white" | "black" | null;
    reason: string;
};

export type PanelStatus = "connecting" | "idle" | "searching" | "playing" | "over";

const DRAW_REASONS: Record<string, string> = {
    stalemate: "By stalemate.",
    repetition: "By threefold repetition.",
    insufficient_material: "Neither side can checkmate.",
    fifty_moves: "By the 50-move rule.",
};

function resultText(result: GameResult, color: "white" | "black" | null) {
    if (result.reason === "connection_lost") {
        return { title: "Connection lost.", subtitle: "Your connection dropped, so the game ended." };
    }
    if (result.winner === null) {
        return { title: "Draw.", subtitle: DRAW_REASONS[result.reason] ?? "The game is a draw." };
    }
    if (result.reason === "opponent_left") {
        return { title: "Opponent left.", subtitle: "You win." };
    }
    return { title: "Checkmate.", subtitle: result.winner === color ? "You win." : "You lose." };
}

// Counts up from 0:00. It starts fresh every time it appears, because a new search mounts a new timer.
function SearchTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const minutes = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, "0");
    return <p className="mt-1 text-sm text-slate-500 tabular-nums">{minutes}:{secs}</p>;
}

export const GamePanel = ({ status, color, isMyTurn, moveNumber, result, onFindMatch, onPlayAgain }: {
    status: PanelStatus;
    color: "white" | "black" | null;
    isMyTurn: boolean;
    moveNumber: number;
    result: GameResult | null;
    onFindMatch: () => void;
    onPlayAgain: () => void;
}) => {
    const ended = result ? resultText(result, color) : null;

    return (
        <aside className="w-full lg:w-[22rem] min-h-[340px] pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_-20px_rgba(0,0,0,0.8)] p-8 flex flex-col justify-center">

            {status === "connecting" && (
                <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full motion-safe:animate-spin" />
                    <p className="mt-6 text-lg text-slate-200">Connecting to the server</p>
                    <p className="mt-2 text-sm text-slate-500 max-w-xs">
                        If it was asleep, this can take up to a minute.
                    </p>
                </div>
            )}

            {status === "idle" && (
                <div>
                    <h2 className="font-display text-5xl font-bold text-white leading-none">Ready to play?</h2>
                    <p className="mt-4 text-slate-400 leading-relaxed">
                        You'll be paired with the next player who's looking for a game.
                    </p>
                    <div className="mt-8">
                        <Button onClick={onFindMatch}>Find a match</Button>
                    </div>
                </div>
            )}

            {status === "searching" && (
                <div className="flex flex-col items-center text-center">
                    <img src="/wn.svg" alt="" className="w-16 h-16 motion-safe:animate-pulse" />
                    <p className="mt-6 text-lg text-slate-200">Finding an opponent</p>
                    <SearchTimer />
                </div>
            )}

            {status === "playing" && (
                <div>
                    <div className="flex items-center gap-3 text-slate-400">
                        <img src={color === "white" ? "/wk.svg" : "/bk.svg"} alt="" className="w-8 h-8" />
                        <span>You're playing {color}</span>
                    </div>
                    {/* Both headlines stay on the page, stacked in the same spot; we fade between them */}
                    <div className="mt-10 grid">
                        <h2
                            aria-hidden={!isMyTurn}
                            className={`[grid-area:1/1] font-display text-6xl font-bold leading-none text-white transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${isMyTurn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                        >
                            Your move.
                        </h2>
                        <h2
                            aria-hidden={isMyTurn}
                            className={`[grid-area:1/1] font-display text-6xl font-bold leading-none text-slate-500 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${isMyTurn ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                        >
                            Their move.
                        </h2>
                    </div>
                    <p className="mt-6 text-sm text-slate-500 tabular-nums">Move {moveNumber}</p>
                </div>
            )}

            {status === "over" && ended && (
                <div>
                    <h2 className="font-display text-5xl font-bold text-white leading-none">{ended.title}</h2>
                    <p className="mt-4 text-lg text-slate-300">{ended.subtitle}</p>
                    <div className="mt-8">
                        <Button onClick={onPlayAgain}>Play again</Button>
                    </div>
                </div>
            )}
        </aside>
    );
};