import { ButtonInteraction } from 'discord.js';
import { GameManager } from '../../domain/GameManager';
import { GameState } from '../../domain/types';
import { StateMachine } from '../../domain/StateMachine';
import { CustomIds, Messages } from '../constants';
import { UIFactory } from '../ui/UIFactory';

export class ButtonHandler {
    static async handle(interaction: ButtonInteraction): Promise<void> {
        const gameManager = GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);

        if (!session) {
            await interaction.reply({ content: Messages.ERRors.NO_ACTIVE_GAME, ephemeral: true });
            return;
        }

        try {
            switch (interaction.customId) {
                case CustomIds.JOIN_GAME:
                    await this.handleJoinGame(interaction, session);
                    break;
                case CustomIds.START_GAME:
                    await this.handleStartGame(interaction, session);
                    break;
                case CustomIds.START_GAME_LOCAL:
                    await this.handleStartGameLocal(interaction, session);
                    break;
                case CustomIds.REVEAL_LOCAL_ROLE:
                    await this.handleRevealLocalRole(interaction, session);
                    break;
                case CustomIds.OPEN_VOTE_MENU:
                    await this.handleOpenVoteMenu(interaction, session);
                    break;
                case CustomIds.OPEN_MULTI_VOTE_MODAL:
                    await this.handleOpenMultiVoteModal(interaction, session);
                    break;
                default:
                    // Unknown button or handled elsewhere?
                    break;
            }
        } catch (error: any) {
            console.error('Error handling button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
            }
        }
    }

    private static async handleJoinGame(interaction: ButtonInteraction, session: any): Promise<void> {
        if (session.state !== GameState.START) return;
        try {
            GameManager.getInstance().addPlayer(interaction.channelId, {
                userId: interaction.user.id,
                role: 'INOCENTS',
                hasSeenRole: false,
                name: interaction.user.username
            });
            await interaction.update({
                content: `**NUEVA PARTIDA: ${session.mode}**\nHost: <@${session.hostId}>\nJugadores: ${session.players.length} (${session.players.map((p: any) => `<@${p.userId}>`).join(', ')})`
            });
        } catch (e) {
            await interaction.reply({ content: Messages.ERRors.ALREADY_JOINED, ephemeral: true });
        }
    }

    private static async handleStartGame(interaction: ButtonInteraction, session: any): Promise<void> {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: Messages.ERRors.HOST_ONLY, ephemeral: true });
            return;
        }
        if (session.players.length < 3) {
            await interaction.reply({ content: Messages.ERRors.NEED_MORE_PLAYERS, ephemeral: true });
            return;
        }

        await StateMachine.transition(session, GameState.ASSIGNING);
        await interaction.deferUpdate();

        if (session.mode === 'MULTI') {
            const sendPromises = session.players.map(async (p: any) => {
                try {
                    const user = await interaction.client.users.fetch(p.userId);
                    if (p.role === 'IMPOSTOR') {
                        await user.send(Messages.Game.DM_IMPOSTOR);
                    } else {
                        await user.send(Messages.Game.DM_INOCENT(session.word));
                    }
                } catch (err) {
                    console.error(`Failed to send DM to ${p.userId}`, err);
                }
            });

            await Promise.all(sendPromises);

            const row = UIFactory.createVoteButtonRow('Votación uwu');
            await StateMachine.transition(session, GameState.PLAYING);

            await interaction.editReply({
                content: Messages.Game.GAME_STARTED_MULTI,
                components: [row]
            });

        } else {
            // Local flow placeholder if mixed
            await interaction.deleteReply(); // Should not happen here if logic is correct
        }
    }

    private static async handleStartGameLocal(interaction: ButtonInteraction, session: any): Promise<void> {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: Messages.ERRors.HOST_ONLY, ephemeral: true });
            return;
        }

        await StateMachine.transition(session, GameState.ASSIGNING);

        session.currentPlayerIndex = 0;
        const row = UIFactory.createRevealLocalRoleRow(session.currentPlayerIndex);

        await interaction.update({
            content: Messages.Game.ASSIGNING_PHASE("Inicio", 1),
            components: [row]
        });
    }

    private static async handleRevealLocalRole(interaction: ButtonInteraction, session: any): Promise<void> {
        const idx = session.currentPlayerIndex ?? 0;
        if (idx >= session.players.length) return;

        const modal = UIFactory.createRevealNameModal(idx);
        await interaction.showModal(modal);
    }

    private static async handleOpenVoteMenu(interaction: ButtonInteraction, session: any): Promise<void> {
        if (interaction.user.id !== session.hostId) {
            await interaction.reply({ content: Messages.ERRors.ONLY_HOST_VOTE, ephemeral: true });
            return;
        }

        if (session.mode === 'MULTI') {
            await StateMachine.transition(session, GameState.VOTING);
            const buttonRow = UIFactory.createMultiVoteButtonRow();

            await interaction.reply({
                content: Messages.Game.VOTE_NOW_BUTTON,
                components: [buttonRow]
            });

        } else {
            // LOCAL MODE
            const row = UIFactory.createVoteSelectMenu(session, CustomIds.SUBMIT_LOCAL_VOTE, '¿Quién fue eliminado?');
            await interaction.reply({
                content: Messages.Game.VOTE_PHASE_START,
                components: [row],
                ephemeral: true
            });
        }
    }

    private static async handleOpenMultiVoteModal(interaction: ButtonInteraction, session: any): Promise<void> {
        const row = UIFactory.createVoteSelectMenu(session, CustomIds.SUBMIT_MULTI_VOTE, '¿Quién es el impostor?');
        await interaction.reply({ content: Messages.Game.VOTE_MODAL_TITLE, components: [row], ephemeral: true });
    }
}
