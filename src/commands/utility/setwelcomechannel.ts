import { CommandInteraction, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { BaseCommand } from "interfaces";

import { WelcomeChannel } from "models/GuildModels";

export default {
    data: new SlashCommandBuilder()
        .setName("setwelcomechannel")
        .setDescription("Sets the welcome channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The channel to set as the welcome channel")
                .setRequired(true)
        ),
    category: "utility",
    permissions: ["Administrator"],
    usage: "setwelcomechannel <channel>",
    examples: [
        "setwelcomechannel #welcome",
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = options.getChannel("channel") as TextChannel;
        const guild = interaction.guild;

        if (!guild) return;

        const welcomeChannel = await WelcomeChannel.findOne({ guildId: guild.id });

        if (!welcomeChannel) {
            await WelcomeChannel.create({
                guildId: guild.id,
                channelId: channel.id,
            });
        } else {
            welcomeChannel.channelId = channel.id;
            await welcomeChannel.save();
        }

        await interaction.reply({
            content: `Welcome channel set to <#${channel.id}>`,
            ephemeral: true,
        });
        return;
    }

} as BaseCommand;