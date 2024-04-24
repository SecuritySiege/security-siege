import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    category: "info",
    async execute(interaction: CommandInteraction): Promise<void> {
        const botLatency = Date.now() - interaction.createdTimestamp;

        await interaction.reply({
            content: `Pong! Bot latency is ${botLatency}ms. API latency is ${interaction.client.ws.ping}ms.`,
            ephemeral: true
        });
    },
} as BaseCommand;