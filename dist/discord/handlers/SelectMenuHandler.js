"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectMenuHandler = void 0;
const GameManager_1 = require("../../domain/GameManager");
const types_1 = require("../../domain/types");
const VoteManager_1 = require("../../domain/VoteManager");
const StateMachine_1 = require("../../domain/StateMachine");
const constants_1 = require("../constants");
const UIFactory_1 = require("../ui/UIFactory");
class SelectMenuHandler {
    static async handle(interaction) {
        const gameManager = GameManager_1.GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);
        if (!session) {
            await interaction.reply({ content: constants_1.Messages.ERRors.SESSION_EXPIRED, ephemeral: true });
            return;
        }
        if (interaction.customId === constants_1.CustomIds.SUBMIT_MULTI_VOTE) {
            await this.handleMultiVote(interaction, session);
        }
        else if (interaction.customId === constants_1.CustomIds.SUBMIT_LOCAL_VOTE) {
            await this.handleLocalVote(interaction, session);
        }
    }
    static async handleMultiVote(interaction, session) {
        const targetId = interaction.values[0];
        const voterId = interaction.user.id;
        try {
            VoteManager_1.VoteManager.castVote(session, voterId, targetId);
            const targetName = targetId === 'SKIP' ? 'Saltar' : session.players.find((p) => p.userId === targetId)?.name;
            await interaction.update({
                content: constants_1.Messages.Game.VOTE_REGISTERED(targetName || 'Unknown'),
                components: []
            });
            const { totalVotes, livingPlayers } = VoteManager_1.VoteManager.getVoteStatus(session);
            if (totalVotes >= livingPlayers) {
                const gameManager = GameManager_1.GameManager.getInstance();
                const result = VoteManager_1.VoteManager.processVoteResult(session);
                if (result.gameOver) {
                    session.state = types_1.GameState.FINISHED;
                    const winMessage = result.winner === 'INOCENTS' ? constants_1.Messages.Game.WIN_INOCENTS : constants_1.Messages.Game.WIN_IMPOSTOR;
                    const eliminatedText = result.eliminatedName ? constants_1.Messages.Game.ELIMINATED(result.eliminatedName, result.eliminatedRole === 'IMPOSTOR' ? 'EL IMPOSTOR' : 'INOCENTE') : '';
                    if (interaction.channel && 'send' in interaction.channel) {
                        await interaction.channel.send(`${eliminatedText}\n\n${winMessage}`);
                    }
                    gameManager.deleteSession(session.id);
                }
                else {
                    // Continue game
                    await StateMachine_1.StateMachine.transition(session, types_1.GameState.PLAYING);
                    const resultText = result.isTie ? constants_1.Messages.Game.TIE : constants_1.Messages.Game.ELIMINATED(result.eliminatedName || 'Unknown', result.eliminatedRole === 'IMPOSTOR' ? 'EL IMPOSTOR' : 'INOCENTE');
                    const row = UIFactory_1.UIFactory.createVoteButtonRow('🚨 Reunión de Emergencia');
                    if (interaction.channel && 'send' in interaction.channel) {
                        await interaction.channel.send({
                            content: `${resultText}\n\n${constants_1.Messages.Game.ROUND_CONTINUES}`,
                            components: [row]
                        });
                    }
                }
            }
        }
        catch (e) {
            await interaction.reply({ content: `${constants_1.Messages.ERRors.VOTING_ERROR} ${e.message}`, ephemeral: true });
        }
    }
    static async handleLocalVote(interaction, session) {
        const targetId = interaction.values[0];
        const gameManager = GameManager_1.GameManager.getInstance();
        if (targetId === constants_1.CustomIds.SKIP_VOTE) {
            const resultText = '💨 Nadie fue eliminado en esta ronda.';
            const row = UIFactory_1.UIFactory.createVoteButtonRow();
            await interaction.update({ content: `Voto registrado.\n${resultText}`, components: [] });
            await interaction.followUp({
                content: `${resultText}\n\nContinúa la discusión...`,
                components: [row]
            });
            return;
        }
        // Process elimination
        session.alivePlayers.delete(targetId);
        const eliminatedPlayer = session.players.find((p) => p.userId === targetId);
        const resultText = constants_1.Messages.Game.ELIMINATED(eliminatedPlayer?.name, eliminatedPlayer?.role === 'IMPOSTOR' ? 'IMPOSTOR' : 'INOCENTE');
        const aliveImpostors = session.players.filter((p) => session.alivePlayers.has(p.userId) && p.role === 'IMPOSTOR').length;
        const aliveInocents = session.players.filter((p) => session.alivePlayers.has(p.userId) && p.role === 'INOCENTS').length;
        if (aliveImpostors === 0) {
            session.state = types_1.GameState.FINISHED;
            await interaction.update({ content: `${resultText}\n\n${constants_1.Messages.Game.WIN_INOCENTS}`, components: [] });
            await interaction.followUp(`${resultText}\n\n${constants_1.Messages.Game.WIN_INOCENTS}`);
            gameManager.deleteSession(session.id);
            return;
        }
        else if (aliveImpostors >= aliveInocents) {
            session.state = types_1.GameState.FINISHED;
            const impostorName = session.players.find((p) => p.role === 'IMPOSTOR')?.name;
            await interaction.update({ content: `${resultText}\n\n${constants_1.Messages.Game.WIN_IMPOSTOR} Superan o igualan a los inocentes.`, components: [] });
            await interaction.followUp(`${resultText}\n\n${constants_1.Messages.Game.WIN_IMPOSTOR} El impostor era: ${impostorName}`);
            gameManager.deleteSession(session.id);
            return;
        }
        // Continue game
        const row = UIFactory_1.UIFactory.createVoteButtonRow();
        await interaction.update({ content: `Voto registrado.\n${resultText}`, components: [] });
        await interaction.followUp({
            content: `${resultText}\n\nContinúa la discusión...`,
            components: [row]
        });
    }
}
exports.SelectMenuHandler = SelectMenuHandler;
