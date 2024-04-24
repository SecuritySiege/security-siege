import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Replies with your input.")
        .addStringOption(option =>
            option.setName("input")
                .setDescription("The input to say.")
                .setRequired(true)),
    category: "admin",
    async execute(interaction: CommandInteraction): Promise<void> {
        const input = interaction.options.get("input")!.value as string;

        await interaction.reply(input);
    },
} as BaseCommand;