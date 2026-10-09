import type WebSocket from "ws";
import { Game } from "./Game.js";
import { GAME_OVER, INIT_GAME, MOVE, SocketMessageSchema } from "./messages.js";

// User, Game

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;

    constructor() {
        this.games = [];
        this.pendingUser = null;
    }

    addUser(socket: WebSocket){
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket){
        // If they were waiting for a match, take them out of the queue
        if (this.pendingUser === socket) {
            this.pendingUser = null;
            return;
        }

        // If they were in a game, the opponent wins and the game is removed
        const game = this.findGame(socket);
        if (!game) return;
        const leaverIsWhite = game.player1 === socket;
        const opponent = leaverIsWhite ? game.player2 : game.player1;
        opponent.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: leaverIsWhite ? "black" : "white",
                reason: "opponent_left"
            }
        }));
        this.games = this.games.filter(g => g !== game);
    }

    private findGame(socket: WebSocket) {
        return this.games.find(g => g.player1 === socket || g.player2 === socket);
    }

    private addHandler(socket: WebSocket){
        socket.on("message", (data) => {
            let parsedData: unknown;
            try {
                parsedData = JSON.parse(data.toString());
            } catch {
                console.log("Ignoring message that isn't valid JSON");
                return;
            }

            const result = SocketMessageSchema.safeParse(parsedData);
            if (!result.success) {
                console.log("Invalid payload received:", result.error);
                return; 
            }

            const message = result.data;

            if(message.type === INIT_GAME){
                if (this.pendingUser === socket) return;
                if (this.findGame(socket)) return;

                if(this.pendingUser){
                    const game = new Game (this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE && message.move){
                const game = this.findGame(socket);
                if(game){
                    game.makeMove(socket, message.move);
                    // Free the game's memory as soon as it ends
                    if (game.board.isGameOver()) {
                        this.games = this.games.filter(g => g !== game);
                    }
                }
            }
        })
    }
}
