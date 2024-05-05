import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("This is a test command.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "dev",
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("Test command executed!");
    },
} as BaseCommand;