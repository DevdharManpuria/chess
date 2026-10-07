import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";
import DotField from "../components/DotField";
import { SiteNav } from "../components/SiteNav";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

type GameResult = {
    winner: "white" | "black" | null;
    reason: string;
};

const REASON_TEXT: Record<string, string> = {
    checkmate: "Checkmate",
    stalemate: "Stalemate",
    repetition: "Draw by repetition",
    insufficient_material: "Draw: insufficient material",
    fifty_moves: "Draw: 50-move rule",
    opponent_left: "Opponent left",
    connection_lost: "Connection lost",
};

function resultSubtitle(result: GameResult, color: "white" | "black" | null) {
    if (result.reason === "connection_lost") return "Your connection dropped, so the game ended.";
    if (result.winner === null) return "The game is a draw";
    return result.winner === color ? "You win!" : "You lose";
}

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(() => new Chess());
    const [board, setBoard] = useState(() => chess.board());
    const [color, setColor] = useState<"white" | "black" | null>(null);

    const [started, setStarted] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [result, setResult] = useState<GameResult | null>(null);

    useEffect(() => {
        if (!socket) return;
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case INIT_GAME: {
                    const newGame = new Chess();
                    setChess(newGame);
                    setBoard(newGame.board());
                    setColor(message.payload.color);
                    setStarted(true);
                    setWaiting(false);
                    break;
                }
                case MOVE: {
                    chess.move(message.payload);
                    setBoard(chess.board());
                    break;
                }
                case GAME_OVER:
                    setResult(message.payload);
                    break;
            }
        };
    }, [socket, chess]);

    useEffect(() => {
        if (socket) return;
        if (waiting) setWaiting(false);
        if (started && !result) {
            setResult({ winner: null, reason: "connection_lost" });
        }
    }, [socket, started, result, waiting]);



    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden text-slate-200 font-sans flex flex-col">
            
            {/* THE REACT BITS BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <DotField
                        dotRadius={3}
                        dotSpacing={12}
                        bulgeStrength={67}
                        glowRadius={160}
                        sparkle={false}
                        waveAmplitude={0}
                        cursorRadius={500}
                        cursorForce={0.1}
                        bulgeOnly={true}
                        gradientFrom="#10b981" 
                        gradientTo="#1e293b"   
                        glowColor="#064e3b"    
                    />
                </div>
            </div>
            
            {/* SITE NAV */}
            <SiteNav />

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 max-w-screen-xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center py-12 px-6 mt-6 pointer-events-none">
                
                {/* LEFT COLUMN: Floating Board */}
                <div className="w-full max-w-2xl flex justify-center items-center pointer-events-auto">
                    <ChessBoard 
                        board={board}
                        socket={socket} 
                        chess={chess} 
                        setBoard={setBoard} 
                        color={color}
                        disabled={!started || result !== null}
                    />
                </div>

                {/* RIGHT COLUMN: Minimalist Control Panel */}
                <div className="w-full lg:w-96 bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[450px] pointer-events-auto shadow-2xl">
                    
                    {!socket ? (
                        <div className="flex flex-col items-center space-y-6 text-center">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <div className="text-slate-200 text-lg font-medium tracking-wide">Connecting to server...</div>
                            <div className="text-sm text-slate-500 max-w-xs">
                                If the server was asleep, this can take up to a minute.
                            </div>
                        </div>
                    ) : (
                        <>
                    
                    {!started && !waiting && (
                        <div className="text-center w-full">
                            <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">DevChess</h2>
                            <p className="text-slate-400 mb-10 font-medium">Play chess online globally.</p>
                            <Button onClick={() => {
                                    socket.send(JSON.stringify({type: INIT_GAME}));
                                    setWaiting(true);
                                }}>
                                    <span className="flex items-center gap-2 text-lg px-4 py-1">
                                        <span className="text-xl">⚔️</span> Find Match
                                    </span>
                                </Button>
                        </div>
                    )}
                    
                    {waiting && (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <div className="text-slate-200 text-lg font-medium tracking-wide animate-pulse">Searching for opponent...</div>
                        </div>
                    )}
                    
                    {started && !result &&(
                        <div className="w-full space-y-6 flex flex-col h-full justify-between">
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] flex items-center justify-between">
                                <span className="text-slate-400 font-medium">Playing as</span>
                                <span className="text-emerald-400 font-bold text-lg capitalize">{color}</span>
                            </div>
                            
                            <div className="flex-1 border border-white/[0.05] rounded-xl bg-black/20 w-full flex items-center justify-center min-h-[150px]">
                                <span className="text-slate-500 text-sm font-medium tracking-widest uppercase">Match in progress</span>
                            </div>
                        </div>
                    )}
                    
                    {result && (
                        <div className="mt-6 w-full bg-emerald-900/40 border border-emerald-500/30 p-6 rounded-xl text-center shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md">
                            <div className="text-3xl font-black text-emerald-400 mb-2 tracking-tight">
                                {REASON_TEXT[result.reason] ?? "Game over"}
                            </div>
                            <div className="text-lg text-slate-300 mb-6">
                                {resultSubtitle(result, color)}
                            </div>
                            <Button onClick={() => window.location.reload()}>
                                Play Again
                            </Button>
                        </div>
                    )}
                        </>
                )}
                </div>
            </div>
        </div>
    );
};