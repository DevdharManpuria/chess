import type { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE, type GameOverReason, type Move } from "./messages.js";

export class Game {
    public player1: WebSocket; // white
    public player2: WebSocket; // black
    public board: Chess;
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: { color: "white" }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: { color: "black" }
        }));
    }

    makeMove(socket: WebSocket, move: Move) {
        // Only the player whose turn it is may move. The board itself knows whose turn it is.
        const whiteToMove = this.board.turn() === "w";
        const mover = whiteToMove ? this.player1 : this.player2;
        if (socket !== mover) return;

        const { from, to, promotion } = move;
        try {
            // Only include promotion when it's present (see note below)
            this.board.move(promotion ? { from, to, promotion } : { from, to });
        } catch {
            return; // illegal move: ignore it
        }

        // Relay every move to the opponent, including the one that ends the game
        const opponent = whiteToMove ? this.player2 : this.player1;
        opponent.send(JSON.stringify({ type: MOVE, payload: move }));

        if (this.board.isGameOver()) {
            const result = JSON.stringify({ type: GAME_OVER, payload: this.getResult() });
            this.player1.send(result);
            this.player2.send(result);
        }
    }

    private getResult(): { winner: "white" | "black" | null; reason: GameOverReason } {
        if (this.board.isCheckmate()) {
            // The side to move is the side that got checkmated
            return { winner: this.board.turn() === "w" ? "black" : "white", reason: "checkmate" };
        }
        if (this.board.isStalemate()) return { winner: null, reason: "stalemate" };
        if (this.board.isThreefoldRepetition()) return { winner: null, reason: "repetition" };
        if (this.board.isInsufficientMaterial()) return { winner: null, reason: "insufficient_material" };
        // The only other way a game ends is the 50-move rule
        return { winner: null, reason: "fifty_moves" };
    }
}