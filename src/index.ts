import 'dotenv/config';
import { Client, GatewayIntentBits, Events, Interaction } from 'discord.js';
import { InteractionHandler } from './discord/InteractionHandler';
import { WordService } from './services/WordService';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ]
});

console.log('TOKEN:', process.env.DISCORD_TOKEN);
const TOKEN = process.env.DISCORD_TOKEN;

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
        await InteractionHandler.handle(interaction);
    } catch (error) {
        console.error('Interaction Error:', error);
        if (interaction.isRepliable()) {
            const reply = { content: 'An error occurred while processing your request.', ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
});

// Handle Login
if (!TOKEN) {
    console.warn("No DISCORD_TOKEN provided in .env. Bot will not login.");
} else {
    client.login(TOKEN);
}
