import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, ButtonInteraction } from "discord.js";
import Logger from "../../classes/Logger";

import { config } from "config/config";

export default {
    name: "interactionCreate",
    async execute(client: BaseClient<true>, interaction: CommandInteraction | AutocompleteInteraction | ChatInputCommandInteraction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.category === "dev" && !config.ownerIDs.includes(interaction.user.id)) {
                await interaction.reply({ content: "You are not the owner of this bot!", ephemeral: true });
                return;
            }

            if (command.permissions && !interaction.memberPermissions?.has(command.permissions, true)) {
                await interaction.reply(
                    {
                        content: "You do not have permission to use this command!",
                        ephemeral: true,
                    }
                )
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                Logger.error(error as Error);
                await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                Logger.error(error as Error);
            }
        }
        // } else if (interaction.isButton()) {
        //     const button = client.buttons.get((interaction as ButtonInteraction).customId);

        //     if (!button) return;

        //     try {
        //         await button.execute(interaction as ButtonInteraction);
        //     } catch (error) {
        //         Logger.error(error as Error);
        //     }
        // }
    }
} as BaseEvent;