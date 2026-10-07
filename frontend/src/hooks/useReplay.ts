import { useEffect, useState } from "react";
import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import { FAMOUS_GAME } from "../data/famousGame";

export type HeroPiece = {
    id: string;        // never changes for this piece's whole life; React uses it to keep the same element
    type: PieceSymbol; // "p", "n", "b", "r", "q", "k"
    color: Color;      // "w" or "b"
    square: Square;    // where it is right now, e.g. "e4"
    captured: boolean; // captured pieces stay in the list but are hidden
};

// Build the 32 starting pieces. Each piece's id is the square it STARTED on,
// so "e2" is always white's king pawn, wherever it ends up later.
function startingPieces(): HeroPiece[] {
    const pieces: HeroPiece[] = [];
    for (const row of new Chess().board()) {
        for (const cell of row) {
            if (cell) {
                pieces.push({ id: cell.square, type: cell.type, color: cell.color, square: cell.square, captured: false });
            }
        }
    }
    return pieces;
}

// Given the pieces and a move chess.js just played, return the pieces after that move.
function applyMove(pieces: HeroPiece[], move: Move): HeroPiece[] {
    const rank = move.from[1];

    // En passant ("e" flag) is the one capture where the captured pawn isn't on the destination square
    const capturedSquare = move.flags.includes("e") ? `${move.to[0]}${rank}` : move.to;

    // Castling moves two pieces: the king (handled below) and a rook
    const rookMove =
        move.flags.includes("k") ? { from: `h${rank}`, to: `f${rank}` } :  // kingside
        move.flags.includes("q") ? { from: `a${rank}`, to: `d${rank}` } :  // queenside
        null;

    return pieces.map((p) => {
        if (p.captured) return p;
        if (move.captured && p.square === capturedSquare) return { ...p, captured: true };
        if (p.square === move.from) return { ...p, square: move.to, type: move.promotion ?? p.type };
        if (rookMove && p.square === rookMove.from) return { ...p, square: rookMove.to as Square };
        return p;
    });
}

// Half-move 0 -> "1. Nf3", half-move 1 -> "1... Nf6"
function formatMove(ply: number, san: string) {
    const number = Math.floor(ply / 2) + 1;
    return ply % 2 === 0 ? `${number}. ${san}` : `${number}... ${san}`;
}

const START_DELAY_MS = 1000; // pause before the first move
const MOVE_DELAY_MS = 1100;  // time between moves
const END_PAUSE_MS = 4000;   // how long the final position stays before restarting

export const useReplay = () => {
    const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
    const [moveText, setMoveText] = useState("");
    const [pieces, setPieces] = useState(startingPieces);

    useEffect(() => {
        const chess = new Chess();
        // Respect users who asked their system for less motion: show one still position instead of autoplay
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            let still = startingPieces();
            let move: Move | null = null;
            for (const san of FAMOUS_GAME.moves.slice(0, FAMOUS_GAME.keyMoment)) {
                move = chess.move(san);
                still = applyMove(still, move);
            }
            setPieces(still);
            if (move) {
                setLastMove({ from: move.from, to: move.to });
                setMoveText(formatMove(FAMOUS_GAME.keyMoment - 1, move.san));
            }
            return;
        }
        let ply = 0; // half-moves played so far
        let timer: ReturnType<typeof setTimeout>;

        const restart = () => {
            chess.reset();
            ply = 0;
            setPieces(startingPieces());
            setLastMove(null);
            setMoveText("");
            timer = setTimeout(step, START_DELAY_MS);
        };

        const step = () => {
            if (ply >= FAMOUS_GAME.moves.length) {
                timer = setTimeout(restart, END_PAUSE_MS);
                return;
            }

            const san = FAMOUS_GAME.moves[ply];
            let move: Move;
            try {
                move = chess.move(san);
            } catch {
                console.error(`Replay stopped: "${san}" isn't legal at half-move ${ply}`);
                return;
            }

            setPieces((prev) => applyMove(prev, move));
            setLastMove({ from: move.from, to: move.to });
            setMoveText(formatMove(ply, move.san));
            ply++;
            timer = setTimeout(step, MOVE_DELAY_MS);
        };

        // Pause while the tab is hidden; resume when the user comes back
        const onVisibilityChange = () => {
            clearTimeout(timer);
            if (document.visibilityState === "visible") {
                timer = setTimeout(step, MOVE_DELAY_MS);
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        timer = setTimeout(step, START_DELAY_MS);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    return { pieces, lastMove, moveText };
};