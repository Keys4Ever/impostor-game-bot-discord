import { ModalSubmitInteraction } from 'discord.js';
import { GameManager } from '../../domain/GameManager';
import { GameState } from '../../domain/types';
import { StateMachine } from '../../domain/StateMachine';
import { CustomIds, Messages } from '../constants';
import { UIFactory } from '../ui/UIFactory';

export class ModalHandler {
    static async handle(interaction: ModalSubmitInteraction): Promise<void> {
        if (interaction.customId === CustomIds.REVEAL_NAME_MODAL) {
            await this.handleRevealNameModal(interaction);
        }
    }

    private static async handleRevealNameModal(interaction: ModalSubmitInteraction): Promise<void> {
        if (!interaction.channelId) return;

        const gameManager = GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);
        if (!session) {
            await interaction.reply({ content: Messages.ERRors.SESSION_EXPIRED, ephemeral: true });
            return;
        }

        const name = interaction.fields.getTextInputValue(CustomIds.PLAYER_NAME_INPUT);
        const idx = session.currentPlayerIndex ?? 0;
        const player = session.players[idx];

        player.name = name;
        player.hasSeenRole = true;

        const roleInfo = player.role === 'IMPOSTOR'
            ? Messages.Game.ROLE_INFO_IMPOSTOR
            : Messages.Game.ROLE_INFO_INOCENT(session.word);

        await interaction.reply({
            content: `Hola **${name}**.\n\n${roleInfo}\n\n*Dale a "Ocultar" o descarta este mensaje antes de pasar el teléfono.*`,
            ephemeral: true
        });

        session.currentPlayerIndex = idx + 1;

        if (session.currentPlayerIndex >= session.players.length) {
            await StateMachine.transition(session, GameState.PLAYING);

            const row = UIFactory.createVoteButtonRow();

            await interaction.message?.edit({
                content: Messages.Game.ALL_ROLES_SEEN,
                components: [row]
            });
        } else {
            const nextP = session.players[session.currentPlayerIndex];
            const row = UIFactory.createRevealLocalRoleRow(session.currentPlayerIndex);

            await interaction.message?.edit({
                content: Messages.Game.ASSIGNING_PHASE_UPDATE(name, session.currentPlayerIndex + 1),
                components: [row]
            });
        }
    }
}
