"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const InteractionHandler_1 = require("./discord/InteractionHandler");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ]
});
console.log('TOKEN:', process.env.DISCORD_TOKEN);
const TOKEN = process.env.DISCORD_TOKEN;
client.once(discord_js_1.Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    try {
        await InteractionHandler_1.InteractionHandler.handle(interaction);
    }
    catch (error) {
        console.error('Interaction Error:', error);
        if (interaction.isRepliable()) {
            const reply = { content: 'An error occurred while processing your request.', ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(reply);
            }
            else {
                await interaction.reply(reply);
            }
        }
    }
});
// Handle Login
if (!TOKEN) {
    console.warn("No DISCORD_TOKEN provided in .env. Bot will not login.");
}
else {
    client.login(TOKEN);
}
