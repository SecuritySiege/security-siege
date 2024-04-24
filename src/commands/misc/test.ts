import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("This is a test command."),
    category: "misc",
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("Test command executed!");
    },
} as BaseCommand;