import { useEffect, useState } from "react";
import { GamePanel, type GameResult } from "../components/GamePanel";
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";
import DotField from "../components/DotField";
import { SiteNav } from "../components/SiteNav";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

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

    // Derive the panel's single status from the state we already have
    const status =
        !socket ? "connecting" :
        result ? "over" :
        started ? "playing" :
        waiting ? "searching" :
        "idle";

    const isMyTurn = color !== null && chess.turn() === color[0];
    const moveNumber = chess.moveNumber();

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
            <div className="relative z-10 max-w-screen-xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-12 items-center lg:items-center justify-center py-12 px-6 mt-6 pointer-events-none">
                
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
                {/* RIGHT COLUMN: the game panel */}
                <GamePanel
                    status={status}
                    color={color}
                    isMyTurn={isMyTurn}
                    moveNumber={moveNumber}
                    result={result}
                    onFindMatch={() => {
                        socket?.send(JSON.stringify({ type: INIT_GAME }));
                        setWaiting(true);
                    }}
                    onPlayAgain={() => window.location.reload()}
                />
            </div>
        </div>
    );
};