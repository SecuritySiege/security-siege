import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, TextChannel, ChannelType } from "discord.js";
import { BaseCommand } from "../../interfaces";

import Logger from "classes/Logger";
import Utility from "classes/Utility";

export default {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlocks a locked channel")
        .addChannelOption(channel => channel.setName("channel").setDescription("Channel to unlock").setRequired(true))
        .addStringOption(message => message.setName("message").setDescription("The message to send in the unlock channel.")),
    category: "moderation",
    usage: "unlock <channel> [message]",
    examples: [
        "unlock #general",
        "unlock #general This channel has been unlocked"
    ],
    permissions: ["Administrator"],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = options.getChannel("channel") as TextChannel;
        const message = options.getString("message") as string;

        if (!channel) return interaction.reply({ content: "Please specify a channel to lock", ephemeral: true });

        if (!channel.isTextBased() || channel.type !== ChannelType.GuildText) return interaction.reply({ content: "You can only lock text channels", ephemeral: true });

        try {
            await Utility.unlockChannel(channel);
            await interaction.reply({ content: `Unlocked ${channel}`, ephemeral: true });

            if (message) {
                await channel.send(message)
            } else { return };
        } catch (error) {
            Logger.error(error as Error);
            await interaction.reply({ content: "Failed to unlock the channel", ephemeral: true });
        }
    }
} as BaseCommand;