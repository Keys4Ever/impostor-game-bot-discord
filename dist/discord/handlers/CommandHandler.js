"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const GameManager_1 = require("../../domain/GameManager");
const WordService_1 = require("../../services/WordService");
const constants_1 = require("../constants");
const UIFactory_1 = require("../ui/UIFactory");
class CommandHandler {
    static async handle(interaction) {
        const { commandName } = interaction;
        if (commandName === 'impostor') {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'start') {
                await this.handleStart(interaction);
            }
            else if (subcommand === 'word') {
                await this.handleWord(interaction);
            }
        }
    }
    static async handleStart(interaction) {
        const modeInput = interaction.options.getString('mode')?.toUpperCase();
        if (modeInput !== 'MULTI' && modeInput !== 'LOCAL') {
            await interaction.reply({ content: constants_1.Messages.ERRors.INVALID_MODE, ephemeral: true });
            return;
        }
        const mode = modeInput;
        const gameManager = GameManager_1.GameManager.getInstance();
        try {
            if (!interaction.channelId || !interaction.guildId) {
                await interaction.reply({ content: constants_1.Messages.ERRors.CANNOT_START_HERE, ephemeral: true });
                return;
            }
            if (gameManager.getSession(interaction.channelId)) {
                await interaction.reply({ content: constants_1.Messages.ERRors.GAME_ALREADY_RUNNING, ephemeral: true });
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
                const row = UIFactory_1.UIFactory.createJoinGameRow(mode);
                await interaction.reply({
                    content: constants_1.Messages.Game.NEW_GAME_MULTI(interaction.user.id),
                    components: [row]
                });
            }
            else {
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
                const row = UIFactory_1.UIFactory.createStartGameLocalRow();
                await interaction.reply({
                    content: constants_1.Messages.Game.NEW_GAME_LOCAL(count),
                    components: [row]
                });
            }
        }
        catch (e) {
            await interaction.reply({ content: `Error: ${e.message}`, ephemeral: true });
        }
    }
    static async handleWord(interaction) {
        const action = interaction.options.getString('action');
        const text = interaction.options.getString('text');
        if (!action) {
            await interaction.reply({ content: constants_1.Messages.ERRors.ACTION_REQUIRED, ephemeral: true });
            return;
        }
        try {
            switch (action) {
                case 'add':
                    if (!text) {
                        await interaction.reply({ content: constants_1.Messages.ERRors.TEXT_REQUIRED, ephemeral: true });
                        return;
                    }
                    await WordService_1.WordService.addWord(text, interaction.guildId || undefined);
                    await interaction.reply({ content: `✅ Palabra agregada: "**${text}**"`, ephemeral: true });
                    break;
                case 'list':
                    const list = await WordService_1.WordService.listWordsFormatted(interaction.guildId || undefined);
                    await interaction.reply({ content: `📜 **Lista de Palabras:**\n${list}`, ephemeral: true });
                    break;
                case 'delete':
                    if (!text) {
                        await interaction.reply({ content: constants_1.Messages.ERRors.ID_REQUIRED, ephemeral: true });
                        return;
                    }
                    await WordService_1.WordService.deleteWord(text);
                    await interaction.reply({ content: `🗑️ Palabra eliminada (ID o Texto: ${text}).`, ephemeral: true });
                    break;
                default:
                    await interaction.reply({ content: constants_1.Messages.ERRors.UNKNOWN_ACTION, ephemeral: true });
            }
        }
        catch (error) {
            console.error('Error in handleWord:', error);
            await interaction.reply({ content: `Error al procesar comando de palabras: ${error.message}`, ephemeral: true });
        }
    }
}
exports.CommandHandler = CommandHandler;
