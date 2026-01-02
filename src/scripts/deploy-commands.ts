import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
// We need to load env vars manually if not using dotenv/config import in main entry
// But for scripts we can just rely on process.env or hardcode for dev if needed
// Assuming we run this with `ts-node` and validation

const commands = [
    new SlashCommandBuilder()
        .setName('impostor')
        .setDescription('Impostor Game Commands')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start a new game')
                .addStringOption(option =>
                    option.setName('mode')
                        .setDescription('Game Mode (MULTI or LOCAL)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Multiplayer', value: 'MULTI' },
                            { name: 'Local', value: 'LOCAL' }
                        )
                )
                .addIntegerOption(option =>
                    option.setName('players')
                        .setDescription('Number of players (Required for LOCAL)')
                        .setRequired(false)
                        .setMinValue(3)
                        .setMaxValue(20)
                )
        )
        .addSubcommand(sub =>
            sub.setName('word')
                .setDescription('Manage words')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action: list, add, delete')
                        .setRequired(true)
                        .addChoices(
                            { name: 'List', value: 'list' },
                            { name: 'Add', value: 'add' },
                            { name: 'Delete', value: 'delete' }
                        )
                )
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Word text (for add)')
                        .setRequired(false)
                )
        )
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

const CLIENT_ID = process.env.CLIENT_ID;

(async () => {
    try {
        if (!CLIENT_ID) {
            console.error('Error: CLIENT_ID is missing in .env');
            return;
        }

        console.log('Started refreshing application (/) commands.');

        const GUILD_ID = process.env.GUILD_ID;

        if (GUILD_ID) {
            console.log(`Registering commands to Guild: ${GUILD_ID}`);
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        } else {
            console.log('Registering Global Commands (may take up to 1 hour to update)...');
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
