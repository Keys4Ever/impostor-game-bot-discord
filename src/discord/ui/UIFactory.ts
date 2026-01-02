import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { CustomIds } from '../constants';
import { GameSession, Player } from '../../domain/types';

export class UIFactory {

    static createJoinGameRow(mode: string): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(CustomIds.JOIN_GAME)
                    .setLabel('Unirse')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(CustomIds.START_GAME)
                    .setLabel('Comenzar Partida')
                    .setStyle(ButtonStyle.Success)
            );
    }

    static createStartGameLocalRow(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(CustomIds.START_GAME_LOCAL)
                    .setLabel('Empezar (Repartir Roles)')
                    .setStyle(ButtonStyle.Success)
            );
    }

    static createRevealLocalRoleRow(playerIndex: number): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(CustomIds.REVEAL_LOCAL_ROLE)
                    .setLabel(`Revelar Rol (Jugador ${playerIndex + 1})`)
                    .setStyle(ButtonStyle.Danger)
            );
    }

    static createVoteButtonRow(label: string = 'Votar / Reportar'): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(CustomIds.OPEN_VOTE_MENU)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Danger)
            );
    }

    static createMultiVoteButtonRow(): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(CustomIds.OPEN_MULTI_VOTE_MODAL)
                    .setLabel('🗳️ Emitir Voto Secreto')
                    .setStyle(ButtonStyle.Primary)
            );
    }

    static createVoteSelectMenu(session: GameSession, customId: string, placeholder: string): ActionRowBuilder<StringSelectMenuBuilder> {
        const options = session.players
            .filter(p => session.alivePlayers.has(p.userId))
            .map(p => ({
                label: p.name || `Player ${p.userId}`,
                value: p.userId,
                description: 'Jugador vivo'
            }));

        options.push({ label: 'Saltar (Skip)', value: CustomIds.SKIP_VOTE, description: 'Votar en blanco' });

        return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .addOptions(options)
            );
    }

    static createRevealNameModal(playerIndex: number): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(CustomIds.REVEAL_NAME_MODAL)
            .setTitle(`Jugador ${playerIndex + 1}: Identifícate`);

        const nameInput = new TextInputBuilder()
            .setCustomId(CustomIds.PLAYER_NAME_INPUT)
            .setLabel("Tu Nombre")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
        modal.addComponents(firstActionRow);

        return modal;
    }
}
