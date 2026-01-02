"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const types_1 = require("./types");
class GameManager {
    constructor() {
        this.sessions = new Map();
    }
    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    createSession(channelId, guildId, hostId, mode) {
        if (this.sessions.has(channelId)) {
            throw new Error('Session already exists in this channel');
        }
        const session = {
            id: channelId,
            guildId,
            mode,
            state: types_1.GameState.START,
            players: [],
            alivePlayers: new Set(),
            word: '',
            votes: new Map(),
            hostId,
        };
        this.sessions.set(channelId, session);
        return session;
    }
    getSession(channelId) {
        return this.sessions.get(channelId);
    }
    deleteSession(channelId) {
        return this.sessions.delete(channelId);
    }
    addPlayer(channelId, player) {
        const session = this.getSession(channelId);
        if (!session)
            throw new Error('Session not found');
        if (session.state !== types_1.GameState.START)
            throw new Error('Cannot join game in progress');
        if (session.players.some(p => p.userId === player.userId)) {
            // Player already joined, maybe just update?
            return;
        }
        session.players.push(player);
    }
    removePlayer(channelId, userId) {
        const session = this.getSession(channelId);
        if (!session)
            return;
        session.players = session.players.filter(p => p.userId !== userId);
        session.alivePlayers.delete(userId);
    }
}
exports.GameManager = GameManager;
