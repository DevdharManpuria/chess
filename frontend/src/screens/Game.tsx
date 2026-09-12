import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";
import DotField from "../components/DotField";
import PillNav from "../components/PillNav";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [color, setColor] = useState<"white" | "black" | null>(null);

    const [started, setStarted] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [result, setResult] = useState<"white" | "black" | null>(null);

    useEffect(() => {
        if (!socket) return;
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case INIT_GAME:
                    setChess(new Chess());
                    setBoard(chess.board());
                    setColor(message.payload.color);
                    setStarted(true);
                    setWaiting(false);
                    console.log("Game initialized with color:", message.payload.color);
                    break;
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("Move received");
                    break;
                case GAME_OVER:
                    console.log("Game over", message.payload.winner);
                    setResult(message.payload.winner);
                    break;
            }
        }
    }, [socket, chess]);

    const chessLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M19.333 13.923c-.765 0-1.428-.485-1.688-1.18l-1.396-3.722A2.001 2.001 0 0014.379 8h-4.758a2 2 0 00-1.87 1.34l-1.396 3.72a1.8 1.8 0 01-1.688 1.18H3v2h2.5c.376 0 .732.19.938.508l2.125 3.293A2 2 0 0010.242 21h3.516a2 2 0 001.679-1.077l2.125-3.293a1.12 1.12 0 01.938-.508H21v-2h-1.667zM12 2C9.243 2 7 4.243 7 7v1h10V7c0-2.757-2.243-5-5-5z'/></svg>";

    if (!socket) return <div>Connecting...</div>

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
            
            {/* GSAP PILL NAV */}
            <div className="relative z-[1000] w-full flex justify-center mt-6 [&>div]:!relative [&>div]:!top-0 [&>div]:!left-0">
                <PillNav
                    logo={chessLogo}
                    logoAlt="DevChess"
                    items={[
                        { label: 'Play', href: '#play' },
                        { label: 'Puzzles', href: '#puzzles' },
                        { label: 'Watch', href: '#watch' },
                        { label: 'Leaderboard', href: '#leaderboard' }
                    ]}
                    baseColor="#ffffff"           
                    pillColor="#120F17"           
                    hoveredPillTextColor="#120F17" 
                    pillTextColor="#ffffff"       
                    className="shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/5"
                />
            </div>

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
                    />
                </div>

                {/* RIGHT COLUMN: Minimalist Control Panel */}
                <div className="w-full lg:w-96 bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[450px] pointer-events-auto shadow-2xl">
                    
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
                    
                    {started && (
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
                            <div className="text-3xl font-black text-emerald-400 mb-2 tracking-tight">Checkmate</div>
                            <div className="text-lg text-slate-300 capitalize mb-6">{result} takes the victory</div>
                            <Button onClick={() => window.location.reload()}>
                                Play Again
                            </Button>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
};