import { StringSelectMenuInteraction } from 'discord.js';
import { GameManager } from '../../domain/GameManager';
import { GameState } from '../../domain/types';
import { VoteManager } from '../../domain/VoteManager';
import { StateMachine } from '../../domain/StateMachine';
import { CustomIds, Messages } from '../constants';
import { UIFactory } from '../ui/UIFactory';

export class SelectMenuHandler {
    static async handle(interaction: StringSelectMenuInteraction): Promise<void> {
        const gameManager = GameManager.getInstance();
        const session = gameManager.getSession(interaction.channelId);

        if (!session) {
            await interaction.reply({ content: Messages.ERRors.SESSION_EXPIRED, ephemeral: true });
            return;
        }

        if (interaction.customId === CustomIds.SUBMIT_MULTI_VOTE) {
            await this.handleMultiVote(interaction, session);
        } else if (interaction.customId === CustomIds.SUBMIT_LOCAL_VOTE) {
            await this.handleLocalVote(interaction, session);
        }
    }

    private static async handleMultiVote(interaction: StringSelectMenuInteraction, session: any): Promise<void> {
        const targetId = interaction.values[0];
        const voterId = interaction.user.id;

        try {
            VoteManager.castVote(session, voterId, targetId);
            const targetName = targetId === 'SKIP' ? 'Saltar' : session.players.find((p: any) => p.userId === targetId)?.name;

            await interaction.update({
                content: Messages.Game.VOTE_REGISTERED(targetName || 'Unknown'),
                components: []
            });

            const { totalVotes, livingPlayers } = VoteManager.getVoteStatus(session);

            if (totalVotes >= livingPlayers) {
                const gameManager = GameManager.getInstance();
                const result = VoteManager.processVoteResult(session);

                if (result.gameOver) {
                    session.state = GameState.FINISHED;
                    const winMessage = result.winner === 'INOCENTS' ? Messages.Game.WIN_INOCENTS : Messages.Game.WIN_IMPOSTOR;
                    const eliminatedText = result.eliminatedName ? Messages.Game.ELIMINATED(result.eliminatedName, result.eliminatedRole === 'IMPOSTOR' ? 'EL IMPOSTOR' : 'INOCENTE') : '';

                    if (interaction.channel && 'send' in interaction.channel) {
                        await interaction.channel.send(`${eliminatedText}\n\n${winMessage}`);
                    }
                    gameManager.deleteSession(session.id);
                } else {
                    // Continue game
                    await StateMachine.transition(session, GameState.PLAYING);

                    const resultText = result.isTie ? Messages.Game.TIE : Messages.Game.ELIMINATED(result.eliminatedName || 'Unknown', result.eliminatedRole === 'IMPOSTOR' ? 'EL IMPOSTOR' : 'INOCENTE');
                    const row = UIFactory.createVoteButtonRow('🚨 Reunión de Emergencia');

                    if (interaction.channel && 'send' in interaction.channel) {
                        await interaction.channel.send({
                            content: `${resultText}\n\n${Messages.Game.ROUND_CONTINUES}`,
                            components: [row]
                        });
                    }
                }
            }
        } catch (e: any) {
            await interaction.reply({ content: `${Messages.ERRors.VOTING_ERROR} ${e.message}`, ephemeral: true });
        }
    }

    private static async handleLocalVote(interaction: StringSelectMenuInteraction, session: any): Promise<void> {
        const targetId = interaction.values[0];
        const gameManager = GameManager.getInstance();

        if (targetId === CustomIds.SKIP_VOTE) {
            const resultText = '💨 Nadie fue eliminado en esta ronda.';
            const row = UIFactory.createVoteButtonRow();

            await interaction.update({ content: `Voto registrado.\n${resultText}`, components: [] });
            await interaction.followUp({
                content: `${resultText}\n\nContinúa la discusión...`,
                components: [row]
            });
            return;
        }

        // Process elimination
        session.alivePlayers.delete(targetId);
        const eliminatedPlayer = session.players.find((p: any) => p.userId === targetId);
        const resultText = Messages.Game.ELIMINATED(eliminatedPlayer?.name, eliminatedPlayer?.role === 'IMPOSTOR' ? 'IMPOSTOR' : 'INOCENTE');

        const aliveImpostors = session.players.filter((p: any) => session.alivePlayers.has(p.userId) && p.role === 'IMPOSTOR').length;
        const aliveInocents = session.players.filter((p: any) => session.alivePlayers.has(p.userId) && p.role === 'INOCENTS').length;

        if (aliveImpostors === 0) {
            session.state = GameState.FINISHED;
            await interaction.update({ content: `${resultText}\n\n${Messages.Game.WIN_INOCENTS}`, components: [] });
            await interaction.followUp(`${resultText}\n\n${Messages.Game.WIN_INOCENTS}`);
            gameManager.deleteSession(session.id);
            return;
        } else if (aliveImpostors >= aliveInocents) {
            session.state = GameState.FINISHED;
            const impostorName = session.players.find((p: any) => p.role === 'IMPOSTOR')?.name;
            await interaction.update({ content: `${resultText}\n\n${Messages.Game.WIN_IMPOSTOR} Superan o igualan a los inocentes.`, components: [] });
            await interaction.followUp(`${resultText}\n\n${Messages.Game.WIN_IMPOSTOR} El impostor era: ${impostorName}`);
            gameManager.deleteSession(session.id);
            return;
        }

        // Continue game
        const row = UIFactory.createVoteButtonRow();
        await interaction.update({ content: `Voto registrado.\n${resultText}`, components: [] });
        await interaction.followUp({
            content: `${resultText}\n\nContinúa la discusión...`,
            components: [row]
        });
    }
}
