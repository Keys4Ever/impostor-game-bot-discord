"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIFactory = void 0;
const discord_js_1 = require("discord.js");
const constants_1 = require("../constants");
class UIFactory {
    static createJoinGameRow(mode) {
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.JOIN_GAME)
            .setLabel('Unirse')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.START_GAME)
            .setLabel('Comenzar Partida')
            .setStyle(discord_js_1.ButtonStyle.Success));
    }
    static createStartGameLocalRow() {
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.START_GAME_LOCAL)
            .setLabel('Empezar (Repartir Roles)')
            .setStyle(discord_js_1.ButtonStyle.Success));
    }
    static createRevealLocalRoleRow(playerIndex) {
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.REVEAL_LOCAL_ROLE)
            .setLabel(`Revelar Rol (Jugador ${playerIndex + 1})`)
            .setStyle(discord_js_1.ButtonStyle.Danger));
    }
    static createVoteButtonRow(label = 'Votar / Reportar') {
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.OPEN_VOTE_MENU)
            .setLabel(label)
            .setStyle(discord_js_1.ButtonStyle.Danger));
    }
    static createMultiVoteButtonRow() {
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(constants_1.CustomIds.OPEN_MULTI_VOTE_MODAL)
            .setLabel('🗳️ Emitir Voto Secreto')
            .setStyle(discord_js_1.ButtonStyle.Primary));
    }
    static createVoteSelectMenu(session, customId, placeholder) {
        const options = session.players
            .filter(p => session.alivePlayers.has(p.userId))
            .map(p => ({
            label: p.name || `Player ${p.userId}`,
            value: p.userId,
            description: 'Jugador vivo'
        }));
        options.push({ label: 'Saltar (Skip)', value: constants_1.CustomIds.SKIP_VOTE, description: 'Votar en blanco' });
        return new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(options));
    }
    static createRevealNameModal(playerIndex) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(constants_1.CustomIds.REVEAL_NAME_MODAL)
            .setTitle(`Jugador ${playerIndex + 1}: Identifícate`);
        const nameInput = new discord_js_1.TextInputBuilder()
            .setCustomId(constants_1.CustomIds.PLAYER_NAME_INPUT)
            .setLabel("Tu Nombre")
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true);
        const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(firstActionRow);
        return modal;
    }
}
exports.UIFactory = UIFactory;
