import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";

//TODO: Move together, there is code repition here
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
    }, [socket,chess]);

    if (!socket) return <div>Connecting...</div>

    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard 
                        board={board}
                        socket={socket} 
                        chess={chess} 
                        setBoard={setBoard} 
                        color={color}
                    />
                </div>
                <div className="col-span-2 bg-slate-900 w-full flex justify-center">
                    <div className="pt-8">
                        
                        {/* 3. Conditional UI Rendering */}
                        {!started && !waiting && (
                            <Button onClick={() => {
                                socket.send(JSON.stringify({type: INIT_GAME}));
                                setWaiting(true); // Put player in waiting mode immediately
                            }}>
                                Play 
                            </Button>
                        )}
                        
                        {waiting && (
                            <div className="text-white text-2xl font-bold flex justify-center">
                                Waiting for opponent...
                            </div>
                        )}
                        
                        {started && (
                            <div className="text-white text-2xl font-bold flex justify-center">
                                You are playing as {color === "white" ? "White" : "Black"}
                            </div>
                        )}

                        {result && (
                            <div className="mt-8 bg-green-600 p-6 rounded-lg text-white text-center shadow-lg">
                                <div className="text-3xl font-bold mb-2">Checkmate!</div>
                                <div className="text-xl capitalize">{result} wins</div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
}