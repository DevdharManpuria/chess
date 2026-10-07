// Donald Byrne vs. Bobby Fischer, New York 1956, "The Game of the Century".
// Moves in standard algebraic notation, alternating white and black.
export const FAMOUS_GAME = {
    white: "Donald Byrne",
    black: "Bobby Fischer",
    event: "New York 1956",
    keyMoment: 34, // the move after which Fischer's queen sacrifice is inevitable
    moves: [
        "Nf3", "Nf6",    // 1
        "c4", "g6",      // 2
        "Nc3", "Bg7",    // 3
        "d4", "O-O",     // 4
        "Bf4", "d5",     // 5
        "Qb3", "dxc4",   // 6
        "Qxc4", "c6",    // 7
        "e4", "Nbd7",    // 8
        "Rd1", "Nb6",    // 9
        "Qc5", "Bg4",    // 10
        "Bg5", "Na4",    // 11
        "Qa3", "Nxc3",   // 12
        "bxc3", "Nxe4",  // 13
        "Bxe7", "Qb6",   // 14
        "Bc4", "Nxc3",   // 15
        "Bc5", "Rfe8+",  // 16
        "Kf1", "Be6",    // 17  Fischer leaves his queen hanging: the famous sacrifice
        "Bxb6", "Bxc4+", // 18
        "Kg1", "Ne2+",   // 19
        "Kf1", "Nxd4+",  // 20
        "Kg1", "Ne2+",   // 21
        "Kf1", "Nc3+",   // 22
        "Kg1", "axb6",   // 23
        "Qb4", "Ra4",    // 24
        "Qxb6", "Nxd1",  // 25
        "h3", "Rxa2",    // 26
        "Kh2", "Nxf2",   // 27
        "Re1", "Rxe1",   // 28
        "Qd8+", "Bf8",   // 29
        "Nxe1", "Bd5",   // 30
        "Nf3", "Ne4",    // 31
        "Qb8", "b5",     // 32
        "h4", "h5",      // 33
        "Ne5", "Kg7",    // 34
        "Kg1", "Bc5+",   // 35
        "Kf1", "Ng3+",   // 36
        "Ke1", "Bb4+",   // 37
        "Kd1", "Bb3+",   // 38
        "Kc1", "Ne2+",   // 39
        "Kb1", "Nc3+",   // 40
        "Kc1", "Rc2#",   // 41
    ],
};