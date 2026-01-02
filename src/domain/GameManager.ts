import { GameSession, GameState, GameMode, Player, PlayerRole } from './types';

export class GameManager {
    private static instance: GameManager;
    private sessions: Map<string, GameSession>; // key is channelId

    private constructor() {
        this.sessions = new Map();
    }

    static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    createSession(channelId: string, guildId: string, hostId: string, mode: GameMode): GameSession {
        if (this.sessions.has(channelId)) {
            throw new Error('Session already exists in this channel');
        }

        const session: GameSession = {
            id: channelId,
            guildId,
            mode,
            state: GameState.START,
            players: [],
            alivePlayers: new Set(),
            word: '',
            votes: new Map(),
            hostId,
        };

        this.sessions.set(channelId, session);
        return session;
    }

    getSession(channelId: string): GameSession | undefined {
        return this.sessions.get(channelId);
    }

    deleteSession(channelId: string): boolean {
        return this.sessions.delete(channelId);
    }

    addPlayer(channelId: string, player: Player): void {
        const session = this.getSession(channelId);
        if (!session) throw new Error('Session not found');
        if (session.state !== GameState.START) throw new Error('Cannot join game in progress');
        if (session.players.some(p => p.userId === player.userId)) {
            // Player already joined, maybe just update?
            return;
        }
        session.players.push(player);
    }

    removePlayer(channelId: string, userId: string): void {
        const session = this.getSession(channelId);
        if (!session) return;
        session.players = session.players.filter(p => p.userId !== userId);
        session.alivePlayers.delete(userId);
    }
}
