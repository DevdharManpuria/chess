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

    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const myColor = color === "white" ? "w" : "b";

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
                                        // WHY: Only select the piece if it belongs to your color
                                        if (square?.color === myColor) {
                                            setFrom(squareRepresentation);
                                            // WHY: Ask chess.js for legal moves and save the destination squares to state
                                            const moves = chess.moves({ square: squareRepresentation, verbose: true });
                                            setLegalMoves(moves.map(m => m.to));
                                        }
                                    } else {
                                        // WHY: If you click a different piece of your own color, switch the selection
                                        if (square?.color === myColor) {
                                            setFrom(squareRepresentation);
                                            const moves = chess.moves({ square: squareRepresentation, verbose: true });
                                            setLegalMoves(moves.map(m => m.to));
                                            return; 
                                        }

                                        // WHY: Execute the move
                                        socket.send(JSON.stringify({
                                            type: "move",
                                            move: { from, to: squareRepresentation }
                                        }));
                                        
                                        try {
                                            chess.move({ from, to: squareRepresentation });
                                            setBoard(chess.board());
                                        } catch (e) {
                                            console.log("Invalid move attempted locally", e);
                                        }
                                        
                                        // WHY: Wipe the selection and dots after a move is made
                                        setFrom(null);
                                        setLegalMoves([]);
                                    }
                                }}
                                key={j} 
                                // WHY: 'relative' ensures the dot stays trapped inside this specific square
                                className={`w-16 h-16 relative ${(i + j) % 2 === 0 ? 'bg-[#739552]' : 'bg-[#ebecd0]'}`}
                            >
                                {/* RESTORED: Your exact original layout so the pieces never go off-center */}
                                <div className={`w-full h-full justify-center flex ${from === squareRepresentation ? "bg-yellow-400" : ""}`}>
                                    <div className="h-full justify-center flex flex-col">
                                        {square ? (
                                            <img 
                                                className="w-12 h-12" 
                                                src={`/${square.color}${square.type}.svg`} 
                                                alt={`${square.color} ${square.type}`} 
                                            />
                                        ) : null}
                                    </div>
                                </div>

                                {/* NEW: Independent Overlay for the Dot */}
                                {/* WHY: This floats on top without affecting the flexbox layout of the image */}
                                {legalMoves.includes(squareRepresentation) && (
                                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                                        <div className="w-4 h-4 bg-slate-800 rounded-full opacity-50"></div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            })}
        </div>
    )
}