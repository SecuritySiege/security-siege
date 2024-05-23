import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, TextChannel, ChannelType, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "../../interfaces";

import Logger from "../../classes/Logger";
import Utility from "../../classes/Utility";

export default {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock a channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addChannelOption(option => option.setName("channel").setDescription("The channel to lock")),
    category: "moderation",
    usage: "lock <channel>",
    examples: [
        "lock #general"
    ],
    permissions: ["Administrator"],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = options.getChannel("channel") as TextChannel || interaction.channel as TextChannel;

        if (!channel) return interaction.reply({ content: "Please specify a channel to lock", ephemeral: true });

        if (!channel.isTextBased() || channel.type !== ChannelType.GuildText) return interaction.reply({ content: "You can only lock text channels", ephemeral: true });

        try {
            await Utility.lockChannel(channel);
            await interaction.reply({ content: `Locked ${channel}`, ephemeral: true });
        } catch (error) {
            Logger.error(error as Error);
            await interaction.reply({ content: "Failed to lock the channel", ephemeral: true });
        }
    }
} as BaseCommand;