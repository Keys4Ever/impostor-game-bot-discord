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
                .setDescription('Iniciar un nuevo juego')
                .addStringOption(option =>
                    option.setName('modo')
                        .setDescription('Modo de juego (MULTI o LOCAL)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Multiplayer', value: 'MULTI' },
                            { name: 'Local', value: 'LOCAL' }
                        )
                )
                .addIntegerOption(option =>
                    option.setName('jugadores')
                        .setDescription('Número de jugadores (Requerido para LOCAL)')
                        .setRequired(false)
                        .setMinValue(3)
                        .setMaxValue(20)
                )
        )
        .addSubcommand(sub =>
            sub.setName('word')
                .setDescription('Gestionar palabras')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Acción: mostrar todas, añadir, eliminar')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Mostrar todas', value: 'list' },
                            { name: 'Añadir', value: 'add' },
                            { name: 'Eliminar', value: 'delete' }
                        )
                )
                .addStringOption(option =>
                    option.setName('palabra')
                        .setDescription('Palabra a añadir')
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

        console.log('Started refreshing application (/) commands globally...');
        console.log('Note: Global commands may take up to 1 hour to propagate to all servers.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded global application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
