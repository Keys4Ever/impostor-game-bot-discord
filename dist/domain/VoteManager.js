"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteManager = void 0;
const types_1 = require("./types");
class VoteManager {
    static castVote(session, voterId, targetId) {
        if (session.state !== types_1.GameState.VOTING) {
            throw new Error('Voting is not active');
        }
        if (!session.alivePlayers.has(voterId)) {
            throw new Error('Only alive players can vote');
        }
        if (!session.players.some(p => p.userId === targetId)) {
            if (!session.alivePlayers.has(targetId) && targetId !== 'SKIP') {
                throw new Error('Cannot vote for dead player');
            }
        }
        session.votes.set(voterId, targetId);
    }
    static getVoteStatus(session) {
        return {
            totalVotes: session.votes.size,
            livingPlayers: session.alivePlayers.size
        };
    }
    static resolveVotes(session) {
        const votes = session.votes;
        const voteCounts = {};
        for (const target of votes.values()) {
            voteCounts[target] = (voteCounts[target] || 0) + 1;
        }
        let maxVotes = 0;
        let candidates = [];
        for (const [target, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                candidates = [target];
            }
            else if (count === maxVotes) {
                candidates.push(target);
            }
        }
        if (candidates.length === 1) {
            return {
                eliminatedId: candidates[0],
                voteCounts,
                isTie: false
            };
        }
        else {
            return {
                eliminatedId: null,
                voteCounts,
                isTie: true
            };
        }
    }
    static processVoteResult(session) {
        const voteResult = this.resolveVotes(session);
        session.votes.clear();
        const roundResult = {
            eliminatedId: voteResult.eliminatedId,
            isTie: voteResult.isTie,
            gameOver: false
        };
        if (voteResult.isTie || !voteResult.eliminatedId || voteResult.eliminatedId === 'SKIP') {
            return roundResult;
        }
        // Someone eliminated
        const eliminatedPlayer = session.players.find(p => p.userId === voteResult.eliminatedId);
        if (eliminatedPlayer) {
            session.alivePlayers.delete(eliminatedPlayer.userId);
            roundResult.eliminatedName = eliminatedPlayer.name;
            roundResult.eliminatedRole = eliminatedPlayer.role;
        }
        // Check Win Conditions
        const aliveImpostors = session.players.filter(p => session.alivePlayers.has(p.userId) && p.role === 'IMPOSTOR').length;
        const aliveInocents = session.players.filter(p => session.alivePlayers.has(p.userId) && p.role === 'INOCENTS').length;
        if (aliveImpostors === 0) {
            roundResult.gameOver = true;
            roundResult.winner = 'INOCENTS';
        }
        else if (aliveImpostors >= aliveInocents) {
            roundResult.gameOver = true;
            roundResult.winner = 'IMPOSTOR';
            roundResult.impostorName = session.players.find(p => p.role === 'IMPOSTOR')?.name;
        }
        return roundResult;
    }
}
exports.VoteManager = VoteManager;
