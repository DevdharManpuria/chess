import {z} from "zod";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const MoveSchema = z.object({
    from: z.string().regex(/^[a-h][1-8]$/),
    to: z.string().regex(/^[a-h][1-8]$/),
    promotion: z.enum(["q", "r", "b", "n"]).optional(),
});

export type Move = z.infer<typeof MoveSchema>;

export const SocketMessageSchema = z.object({
    type: z.enum([INIT_GAME, MOVE]),
    move: MoveSchema.optional()
});

export type GameOverReason =
    | "checkmate"
    | "stalemate"
    | "repetition"
    | "insufficient_material"
    | "fifty_moves"
    | "opponent_left";