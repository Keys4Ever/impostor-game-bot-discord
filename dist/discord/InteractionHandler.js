"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionHandler = void 0;
const CommandHandler_1 = require("./handlers/CommandHandler");
const ButtonHandler_1 = require("./handlers/ButtonHandler");
const SelectMenuHandler_1 = require("./handlers/SelectMenuHandler");
const ModalHandler_1 = require("./handlers/ModalHandler");
class InteractionHandler {
    static async handle(interaction) {
        if (interaction.isChatInputCommand()) {
            await CommandHandler_1.CommandHandler.handle(interaction);
        }
        else if (interaction.isButton()) {
            await ButtonHandler_1.ButtonHandler.handle(interaction);
        }
        else if (interaction.isStringSelectMenu()) {
            await SelectMenuHandler_1.SelectMenuHandler.handle(interaction);
        }
        else if (interaction.isModalSubmit()) {
            await ModalHandler_1.ModalHandler.handle(interaction);
        }
    }
}
exports.InteractionHandler = InteractionHandler;
