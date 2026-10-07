import { useState } from "react";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";

export const ChessBoard = ({ board, socket, chess, setBoard, color, disabled }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket | null;
    chess: Chess;
    setBoard: React.Dispatch<React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>>;
    color: "white" | "black" | null;
    disabled: boolean;
}) => {
    const [from, setFrom] = useState<Square | null>(null);

    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const myColor = color === "white" ? "w" : "b";

    const isBlack = color === "black";
    const displayBoard = isBlack ? [...board].reverse().map(row => [...row].reverse()) : board;

    return (
        <div className="w-full max-w-[512px] [view-transition-name:board]">
            {displayBoard.map((row, i) => {
                return <div key={i} className="flex">
                    {row.map((square, j) => {
                        const fileIndex = isBlack ? 7 - j : j;
                        const rankIndex = isBlack ? i + 1 : 8 - i;
                        const squareRepresentation = (String.fromCharCode(97 + fileIndex) + "" + rankIndex) as Square;

                        return (
                            <div 
                                onClick={() => {
                                // WHY: Don't allow interaction if the game hasn't started or is disabled
                                if(disabled || !socket) return;
                                // WHY: You can only interact with the board on your own turn
                                if (chess.turn() !== myColor) return;

                                // WHY: Clicking one of your own pieces selects it, switches selection, or deselects it
                                if (square?.color === myColor) {
                                    if (from === squareRepresentation) {
                                        setFrom(null);
                                        setLegalMoves([]);
                                        return;
                                    }
                                    setFrom(squareRepresentation);
                                    const moves = chess.moves({ square: squareRepresentation, verbose: true });
                                    setLegalMoves(moves.map(m => m.to));
                                    return;
                                }

                                // WHY: No piece selected, and this isn't your piece, so there's nothing to do
                                if (!from) return;

                                // WHY: Clicking a square that isn't a legal destination cancels the selection
                                if (!legalMoves.includes(squareRepresentation)) {
                                    setFrom(null);
                                    setLegalMoves([]);
                                    return;
                                }

                                // WHY: A pawn reaching the last rank must promote. We auto-queen for now.
                                const piece = chess.get(from);
                                const isPromotion =
                                    piece?.type === "p" &&
                                    (squareRepresentation[1] === "8" || squareRepresentation[1] === "1");

                                const move = isPromotion
                                    ? { from, to: squareRepresentation, promotion: "q" }
                                    : { from, to: squareRepresentation };

                                // WHY: Apply locally first; only tell the server about moves chess.js accepted
                                try {
                                    chess.move(move);
                                } catch (e) {
                                    console.log("Invalid move attempted locally", e);
                                    return;
                                }
                                setBoard(chess.board());
                                socket.send(JSON.stringify({ type: "move", move }));

                                // WHY: Wipe the selection and dots after a move is made
                                setFrom(null);
                                setLegalMoves([]);
                            }}
                                key={j} 
                                // WHY: 'relative' ensures the dot stays trapped inside this specific square
                                className={`w-[12.5%] aspect-square relative ${(i + j) % 2 === 0 ? 'bg-[#ebecd0]' : 'bg-[#739552]'}`}
                            >
                                {/* RESTORED: Your exact original layout so the pieces never go off-center */}
                                <div className={`w-full h-full flex items-center justify-center ${from === squareRepresentation ? "bg-yellow-400" : ""}`}>
                                    {square ? (
                                        <img
                                            className="w-[75%] h-[75%]"
                                            src={`/${square.color}${square.type}.svg`}
                                            alt={`${square.color} ${square.type}`}
                                        />
                                    ) : null}
                                </div>

                                {/* NEW: Independent Overlay for the Dot */}
                                {/* WHY: This floats on top without affecting the flexbox layout of the image */}
                                {legalMoves.includes(squareRepresentation) && (
                                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                                        <div className="w-[25%] h-[25%] bg-slate-800 rounded-full opacity-50"></div>
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