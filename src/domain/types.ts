
export enum GameState {
    START = 'START',
    ASSIGNING = 'ASSIGNING',
    PLAYING = 'PLAYING',
    VOTING = 'VOTING',
    FINISHED = 'FINISHED'
}

export type GameMode = 'MULTI' | 'LOCAL';

export type PlayerRole = 'IMPOSTOR' | 'INOCENTS';

export interface Player {
    userId: string;
    name?: string; // For Local Mode or Display Name
    role: PlayerRole;
    hasSeenRole: boolean;
    word?: string; // Only for INOCENTS, but useful to have accessible if needed, though strictly only INOCENTS sees it.
}

export interface GameSession {
    id: string; // channelId
    guildId: string;
    mode: GameMode;
    state: GameState;
    players: Player[]; // All players in the session
    alivePlayers: Set<string>; // userIds of players who are still alive
    word: string; // The secret word for this game
    votes: Map<string, string>; // voterUserId -> targetUserId
    currentPlayerIndex?: number; // For LOCAL mode
    hostId: string; // Who started the game
    messageId?: string; // For LOCAL mode (the main game message) or MULTI (status message)
}
