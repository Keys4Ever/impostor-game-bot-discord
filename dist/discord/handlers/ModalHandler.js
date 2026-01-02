"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalHandler = void 0;
const GameManager_1 = require("../../domain/GameManager");
const types_1 = require("../../domain/types");
const StateMachine_1 = require("../../domain/StateMachine");
const constants_1 = require("../constants");
const UIFactory_1 = require("../ui/UIFactory");
class ModalHandler {
    static async handle(interaction) {
        if (interaction.customId === constants_1.CustomIds.REVEAL_NAME_MODAL) {
            await this.handleRevealNameModal(interaction);
        }
    }
    static async handleRevealNameModal(interaction) {
        if (!interaction.channelId)
            return;
        const gameManager = GameManager_1.GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);
        if (!session) {
            await interaction.reply({ content: constants_1.Messages.ERRors.SESSION_EXPIRED, ephemeral: true });
            return;
        }
        const name = interaction.fields.getTextInputValue(constants_1.CustomIds.PLAYER_NAME_INPUT);
        const idx = session.currentPlayerIndex ?? 0;
        const player = session.players[idx];
        player.name = name;
        player.hasSeenRole = true;
        const roleInfo = player.role === 'IMPOSTOR'
            ? constants_1.Messages.Game.ROLE_INFO_IMPOSTOR
            : constants_1.Messages.Game.ROLE_INFO_INOCENT(session.word);
        await interaction.reply({
            content: `Hola **${name}**.\n\n${roleInfo}\n\n*Dale a "Ocultar" o descarta este mensaje antes de pasar el teléfono.*`,
            ephemeral: true
        });
        session.currentPlayerIndex = idx + 1;
        if (session.currentPlayerIndex >= session.players.length) {
            await StateMachine_1.StateMachine.transition(session, types_1.GameState.PLAYING);
            const row = UIFactory_1.UIFactory.createVoteButtonRow();
            await interaction.message?.edit({
                content: constants_1.Messages.Game.ALL_ROLES_SEEN,
                components: [row]
            });
        }
        else {
            const nextP = session.players[session.currentPlayerIndex];
            const row = UIFactory_1.UIFactory.createRevealLocalRoleRow(session.currentPlayerIndex);
            await interaction.message?.edit({
                content: constants_1.Messages.Game.ASSIGNING_PHASE_UPDATE(name, session.currentPlayerIndex + 1),
                components: [row]
            });
        }
    }
}
exports.ModalHandler = ModalHandler;
