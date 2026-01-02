"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonHandler = void 0;
const GameManager_1 = require("../../domain/GameManager");
const types_1 = require("../../domain/types");
const StateMachine_1 = require("../../domain/StateMachine");
const constants_1 = require("../constants");
const UIFactory_1 = require("../ui/UIFactory");
class ButtonHandler {
    static async handle(interaction) {
        const gameManager = GameManager_1.GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);
        if (!session) {
            await interaction.reply({ content: constants_1.Messages.ERRors.NO_ACTIVE_GAME, ephemeral: true });
            return;
        }
        try {
            switch (interaction.customId) {
                case constants_1.CustomIds.JOIN_GAME:
                    await this.handleJoinGame(interaction, session);
                    break;
                case constants_1.CustomIds.START_GAME:
                    await this.handleStartGame(interaction, session);
                    break;
                case constants_1.CustomIds.START_GAME_LOCAL:
                    await this.handleStartGameLocal(interaction, session);
                    break;
                case constants_1.CustomIds.REVEAL_LOCAL_ROLE:
                    await this.handleRevealLocalRole(interaction, session);
                    break;
                case constants_1.CustomIds.OPEN_VOTE_MENU:
                    await this.handleOpenVoteMenu(interaction, session);
                    break;
                case constants_1.CustomIds.OPEN_MULTI_VOTE_MODAL:
                    await this.handleOpenMultiVoteModal(interaction, session);
                    break;
                default:
                    // Unknown button or handled elsewhere?
                    break;
            }
        }
        catch (error) {
            console.error('Error handling button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
            }
        }
    }
    static async handleJoinGame(interaction, session) {
        if (session.state !== types_1.GameState.START)
            return;
        try {
            GameManager_1.GameManager.getInstance().addPlayer(interaction.channelId, {
                userId: interaction.user.id,
                role: 'INOCENTS',
                hasSeenRole: false,
                name: interaction.user.username
            });
            await interaction.update({
                content: `**NUEVA PARTIDA: ${session.mode}**\nHost: <@${session.hostId}>\nJugadores: ${session.players.length} (${session.players.map((p) => `<@${p.userId}>`).join(', ')})`
            });
        }
        catch (e) {
            await interaction.reply({ content: constants_1.Messages.ERRors.ALREADY_JOINED, ephemeral: true });
        }
    }
    static async handleStartGame(interaction, session) {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: constants_1.Messages.ERRors.HOST_ONLY, ephemeral: true });
            return;
        }
        if (session.players.length < 3) {
            await interaction.reply({ content: constants_1.Messages.ERRors.NEED_MORE_PLAYERS, ephemeral: true });
            return;
        }
        await StateMachine_1.StateMachine.transition(session, types_1.GameState.ASSIGNING);
        await interaction.deferUpdate();
        if (session.mode === 'MULTI') {
            const sendPromises = session.players.map(async (p) => {
                try {
                    const user = await interaction.client.users.fetch(p.userId);
                    if (p.role === 'IMPOSTOR') {
                        await user.send(constants_1.Messages.Game.DM_IMPOSTOR);
                    }
                    else {
                        await user.send(constants_1.Messages.Game.DM_INOCENT(session.word));
                    }
                }
                catch (err) {
                    console.error(`Failed to send DM to ${p.userId}`, err);
                }
            });
            await Promise.all(sendPromises);
            const row = UIFactory_1.UIFactory.createVoteButtonRow('Votación uwu');
            await StateMachine_1.StateMachine.transition(session, types_1.GameState.PLAYING);
            await interaction.editReply({
                content: constants_1.Messages.Game.GAME_STARTED_MULTI,
                components: [row]
            });
        }
        else {
            // Local flow placeholder if mixed
            await interaction.deleteReply(); // Should not happen here if logic is correct
        }
    }
    static async handleStartGameLocal(interaction, session) {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: constants_1.Messages.ERRors.HOST_ONLY, ephemeral: true });
            return;
        }
        await StateMachine_1.StateMachine.transition(session, types_1.GameState.ASSIGNING);
        session.currentPlayerIndex = 0;
        const row = UIFactory_1.UIFactory.createRevealLocalRoleRow(session.currentPlayerIndex);
        await interaction.update({
            content: constants_1.Messages.Game.ASSIGNING_PHASE("Inicio", 1),
            components: [row]
        });
    }
    static async handleRevealLocalRole(interaction, session) {
        const idx = session.currentPlayerIndex ?? 0;
        if (idx >= session.players.length)
            return;
        const modal = UIFactory_1.UIFactory.createRevealNameModal(idx);
        await interaction.showModal(modal);
    }
    static async handleOpenVoteMenu(interaction, session) {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: constants_1.Messages.ERRors.ONLY_HOST_VOTE, ephemeral: true });
            return;
        }
        if (session.mode === 'MULTI') {
            await StateMachine_1.StateMachine.transition(session, types_1.GameState.VOTING);
            const buttonRow = UIFactory_1.UIFactory.createMultiVoteButtonRow();
            await interaction.reply({
                content: constants_1.Messages.Game.VOTE_NOW_BUTTON,
                components: [buttonRow]
            });
        }
        else {
            // LOCAL MODE
            const row = UIFactory_1.UIFactory.createVoteSelectMenu(session, constants_1.CustomIds.SUBMIT_LOCAL_VOTE, '¿Quién fue eliminado?');
            await interaction.reply({
                content: constants_1.Messages.Game.VOTE_PHASE_START,
                components: [row],
                ephemeral: true
            });
        }
    }
    static async handleOpenMultiVoteModal(interaction, session) {
        const row = UIFactory_1.UIFactory.createVoteSelectMenu(session, constants_1.CustomIds.SUBMIT_MULTI_VOTE, '¿Quién es el impostor?');
        await interaction.reply({ content: constants_1.Messages.Game.VOTE_MODAL_TITLE, components: [row], ephemeral: true });
    }
}
exports.ButtonHandler = ButtonHandler;
