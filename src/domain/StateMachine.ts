import { WordService } from '../services/WordService';
import { GameSession, GameState, PlayerRole, Player } from './types';

export class StateMachine {

    static async transition(session: GameSession, newState: GameState): Promise<void> {
        // Validate transition
        if (!StateMachine.isValidTransition(session.state, newState)) {
            throw new Error(`Invalid transition from ${session.state} to ${newState}`);
        }

        session.state = newState;

        // Handle side effects of entering the new state
        switch (newState) {
            case GameState.ASSIGNING:
                await StateMachine.handleAssigning(session);
                break;
            case GameState.PLAYING:
                // Maybe notify "Game Started"
                break;
            case GameState.VOTING:
                session.votes.clear();
                break;
            case GameState.FINISHED:
                // Cleanup or summary
                break;
        }
    }

    private static isValidTransition(current: GameState, next: GameState): boolean {
        // START -> ASSIGNING -> PLAYING -> VOTING -> PLAYING/FINISHED
        // VOTING -> FINISHED
        if (current === GameState.START && next === GameState.ASSIGNING) return true;
        if (current === GameState.ASSIGNING && next === GameState.PLAYING) return true;
        if (current === GameState.PLAYING && next === GameState.VOTING) return true;
        // if (current === GameState.PLAYING && next === GameState.FINISHED) return true; // Maybe via command
        if (current === GameState.VOTING && next === GameState.PLAYING) return true; // Vote resolved, game continues
        if (current === GameState.VOTING && next === GameState.FINISHED) return true; // Impostor caught or won
        if (current === GameState.FINISHED && next === GameState.START) return true; // Restart?
        return false;
    }

    private static async handleAssigning(session: GameSession): Promise<void> {
        // 1. Assign Roles
        const players = session.players;
        if (players.length < 3) {
            throw new Error('Se necesitan al menos 3 jugadores para comenzar');
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

        session.word = await WordService.getRandomWord(session.guildId);

        session.alivePlayers = new Set(players.map(p => p.userId));

        // Auto transition to PLAYING or let UI handle it?
        // In LOCAL mode, we go to "PLAYER N SEE ROLE".
        // In MULTI mode, we send DMs and go to PLAYING.

        // We'll leave the actual notification logic to the caller/controller to keep this pure?
    }
}
