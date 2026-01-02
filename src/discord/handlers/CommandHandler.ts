import { ChatInputCommandInteraction } from 'discord.js';
import { GameManager } from '../../domain/GameManager';
import { GameMode } from '../../domain/types';
import { WordService } from '../../services/WordService';
import { CustomIds, Messages } from '../constants';
import { UIFactory } from '../ui/UIFactory';

export class CommandHandler {
    static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const { commandName } = interaction;

        if (commandName === 'impostor') {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'start') {
                await this.handleStart(interaction);
            } else if (subcommand === 'word') {
                await this.handleWord(interaction);
            }
        }
    }

    private static async handleStart(interaction: ChatInputCommandInteraction): Promise<void> {
        const modeInput = interaction.options.getString('mode')?.toUpperCase();
        if (modeInput !== 'MULTI' && modeInput !== 'LOCAL') {
            await interaction.reply({ content: Messages.ERRors.INVALID_MODE, ephemeral: true });
            return;
        }
        const mode = modeInput as GameMode;
        const gameManager = GameManager.getInstance();

        try {
            if (!interaction.channelId || !interaction.guildId) {
                await interaction.reply({ content: Messages.ERRors.CANNOT_START_HERE, ephemeral: true });
                return;
            }

            if (gameManager.getSession(interaction.channelId)) {
                await interaction.reply({ content: Messages.ERRors.GAME_ALREADY_RUNNING, ephemeral: true });
                return;
            }

            // Create Session
            gameManager.createSession(interaction.channelId, interaction.guildId, interaction.user.id, mode);

            if (mode === 'MULTI') {
                gameManager.addPlayer(interaction.channelId, {
                    userId: interaction.user.id,
                    role: 'INOCENTS',
                    hasSeenRole: false,
                    name: interaction.user.username
                });

                const row = UIFactory.createJoinGameRow(mode);
                await interaction.reply({
                    content: Messages.Game.NEW_GAME_MULTI(interaction.user.id),
                    components: [row]
                });

            } else {
                // LOCAL MODE
                const count = interaction.options.getInteger('players');
                if (!count) {
                    gameManager.deleteSession(interaction.channelId);
                    await interaction.reply({ content: 'Para el modo LOCAL, debes especificar "players" (3-20).', ephemeral: true });
                    return;
                }

                // Create N placeholder players
                for (let i = 0; i < count; i++) {
                    gameManager.addPlayer(interaction.channelId, {
                        userId: `local-p-${i}`,
                        role: 'INOCENTS', // Placeholder
                        hasSeenRole: false,
                        name: `Player ${i + 1}`
                    });
                }

                const row = UIFactory.createStartGameLocalRow();
                await interaction.reply({
                    content: Messages.Game.NEW_GAME_LOCAL(count),
                    components: [row]
                });
            }

        } catch (e: any) {
            await interaction.reply({ content: `Error: ${e.message}`, ephemeral: true });
        }
    }

    private static async handleWord(interaction: ChatInputCommandInteraction): Promise<void> {
        const action = interaction.options.getString('action');
        const text = interaction.options.getString('text');

        if (!action) {
            await interaction.reply({ content: Messages.ERRors.ACTION_REQUIRED, ephemeral: true });
            return;
        }

        try {
            switch (action) {
                case 'add':
                    if (!text) {
                        await interaction.reply({ content: Messages.ERRors.TEXT_REQUIRED, ephemeral: true });
                        return;
                    }
                    await WordService.addWord(text, interaction.guildId || undefined);
                    await interaction.reply({ content: `✅ Palabra agregada: "**${text}**"`, ephemeral: true });
                    break;
                case 'list':
                    const list = await WordService.listWordsFormatted(interaction.guildId || undefined);
                    await interaction.reply({ content: `📜 **Lista de Palabras:**\n${list}`, ephemeral: true });
                    break;
                case 'delete':
                    if (!text) {
                        await interaction.reply({ content: Messages.ERRors.ID_REQUIRED, ephemeral: true });
                        return;
                    }
                    await WordService.deleteWord(text);
                    await interaction.reply({ content: `🗑️ Palabra eliminada (ID o Texto: ${text}).`, ephemeral: true });
                    break;
                default:
                    await interaction.reply({ content: Messages.ERRors.UNKNOWN_ACTION, ephemeral: true });
            }
        } catch (error: any) {
            console.error('Error in handleWord:', error);
            await interaction.reply({ content: `Error al procesar comando de palabras: ${error.message}`, ephemeral: true });
        }
    }
}
