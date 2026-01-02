import { Interaction } from 'discord.js';
import { CommandHandler } from './handlers/CommandHandler';
import { ButtonHandler } from './handlers/ButtonHandler';
import { SelectMenuHandler } from './handlers/SelectMenuHandler';
import { ModalHandler } from './handlers/ModalHandler';

export class InteractionHandler {
    static async handle(interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            await CommandHandler.handle(interaction);
        } else if (interaction.isButton()) {
            await ButtonHandler.handle(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await SelectMenuHandler.handle(interaction);
        } else if (interaction.isModalSubmit()) {
            await ModalHandler.handle(interaction);
        }
    }
}
