import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
    new SlashCommandBuilder()
        .setName('impostor')
        .setDescription('Comandos del juego Impostor')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Iniciar un nuevo juego')
                .addStringOption(option =>
                    option.setName('modo')
                        .setDescription('Modo de juego')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Multiplayer', value: 'MULTI' },
                            { name: 'Local', value: 'LOCAL' }
                        )
                )
                .addIntegerOption(option =>
                    option.setName('jugadores')
                        .setDescription('Número de jugadores (requerido para Local)')
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
                        .setDescription('Palabra a añadir o ID/texto a eliminar')
                        .setRequired(false)
                )
        )
]
    .map(command => command.toJSON());

async function main(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!token) {
        throw new Error('DISCORD_TOKEN is missing in .env');
    }
    if (!clientId) {
        throw new Error('CLIENT_ID is missing in .env');
    }

    const rest = new REST({ version: '10' }).setToken(token);

    if (guildId) {
        console.log(`Refreshing application (/) commands for guild ${guildId}...`);
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        console.log('Successfully reloaded guild application (/) commands.');
    } else {
        console.log('Refreshing application (/) commands globally...');
        console.log('Note: Global commands may take up to 1 hour to propagate.');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded global application (/) commands.');
    }
}

main().catch((error) => {
    console.error('Failed to deploy commands:', error);
    process.exit(1);
});
