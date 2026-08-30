import { useState } from "react";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";

export const ChessBoard = ({ board, socket, chess, setBoard, color }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    chess: Chess;
    setBoard: React.Dispatch<React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>>;
    color: "white" | "black" | null;
}) => {
    const [from, setFrom] = useState<Square | null>(null);

    const isBlack = color === "black";
    const displayBoard = isBlack ? [...board].reverse().map(row => [...row].reverse()) : board;

    return (
        <div className="text-white-200">
            {displayBoard.map((row, i) => {
                return <div key={i} className="flex">
                    {row.map((square, j) => {
                        const fileIndex = isBlack ? 7 - j : j;
                        const rankIndex = isBlack ? i + 1 : 8 - i;
                        const squareRepresentation = (String.fromCharCode(97 + fileIndex) + "" + rankIndex) as Square;

                        return (
                            <div 
                                onClick={() => {
                                if (!from) {
                                    setFrom(squareRepresentation);
                                } else {
                                    socket.send(JSON.stringify({
                                        type: "move",
                                        move: {
                                            from,
                                            to: squareRepresentation
                                        }
                                    }));
                                    try {
                                        chess.move({
                                            from,
                                            to: squareRepresentation
                                        });
                                        setBoard(chess.board());
                                    } 
                                    catch (e) {
                                        console.log("Invalid move attempted locally", e);
                                    }
                                    setFrom(null);
                                }
                            }}
                            key={j} 
                            className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-white'}`}>
                                <div className="w-full justify-center flex h-full">
                                    <div className={`h-full justify-center flex flex-col text-black ${from === squareRepresentation ? "bg-yellow-400" : ""}`}>
                                        {square ? square.type : ""}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            })}
        </div>
    )
}