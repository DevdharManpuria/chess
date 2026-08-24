import {z} from "zod";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const MoveSchema = z.object({
    from: z.string().length(2),
    to: z.string().length(2)
});

export const SocketMessageSchema = z.object({
    type: z.enum([INIT_GAME, MOVE]),
    move: MoveSchema.optional()
});