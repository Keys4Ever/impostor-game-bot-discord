"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = void 0;
const WordService_1 = require("../services/WordService");
const types_1 = require("./types");
class StateMachine {
    static async transition(session, newState) {
        // Validate transition
        if (!StateMachine.isValidTransition(session.state, newState)) {
            throw new Error(`Invalid transition from ${session.state} to ${newState}`);
        }
        session.state = newState;
        // Handle side effects of entering the new state
        switch (newState) {
            case types_1.GameState.ASSIGNING:
                await StateMachine.handleAssigning(session);
                break;
            case types_1.GameState.PLAYING:
                // Maybe notify "Game Started"
                break;
            case types_1.GameState.VOTING:
                session.votes.clear();
                break;
            case types_1.GameState.FINISHED:
                // Cleanup or summary
                break;
        }
    }
    static isValidTransition(current, next) {
        // START -> ASSIGNING -> PLAYING -> VOTING -> PLAYING/FINISHED
        // VOTING -> FINISHED
        if (current === types_1.GameState.START && next === types_1.GameState.ASSIGNING)
            return true;
        if (current === types_1.GameState.ASSIGNING && next === types_1.GameState.PLAYING)
            return true;
        if (current === types_1.GameState.PLAYING && next === types_1.GameState.VOTING)
            return true;
        // if (current === GameState.PLAYING && next === GameState.FINISHED) return true; // Maybe via command
        if (current === types_1.GameState.VOTING && next === types_1.GameState.PLAYING)
            return true; // Vote resolved, game continues
        if (current === types_1.GameState.VOTING && next === types_1.GameState.FINISHED)
            return true; // Impostor caught or won
        if (current === types_1.GameState.FINISHED && next === types_1.GameState.START)
            return true; // Restart?
        return false;
    }
    static async handleAssigning(session) {
        // 1. Assign Roles
        const players = session.players;
        if (players.length < 3) {
            // Technically strict minimum for meaningful game is 3? User didn't specify, but 3 is reasonable.
            // For testing we might allow less.
        }
        // Shuffle
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        // Assign 1 Impostor
        players.forEach(p => p.role = 'INOCENTS');
        const impostorIndex = Math.floor(Math.random() * players.length);
        players[impostorIndex].role = 'IMPOSTOR';
        session.word = await WordService_1.WordService.getRandomWord(session.guildId);
        session.alivePlayers = new Set(players.map(p => p.userId));
        // Auto transition to PLAYING or let UI handle it?
        // In LOCAL mode, we go to "PLAYER N SEE ROLE".
        // In MULTI mode, we send DMs and go to PLAYING.
        // We'll leave the actual notification logic to the caller/controller to keep this pure?
    }
}
exports.StateMachine = StateMachine;
