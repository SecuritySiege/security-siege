import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { BaseCommand } from "interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set the slowmode of a channel")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("set")
                .setDescription("Set the slowmode of a channel")
                .addStringOption((option) =>
                    option
                        .setName("time")
                        .setDescription("Example: 10s | 1m | 1h")
                        .setRequired(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("The channel")
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reset")
                .setDescription("Reset the slowmode of a channel")
                .addChannelOption((subcommand) =>
                    subcommand
                        .setName("channel")
                        .setDescription("The channel")
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    category: "moderation",
    permissions: ["ManageChannels"],
    usage: "/slowmode <set/reset> [time] [channel]",
    examples: [
        "/slowmode set 10s",
        "/slowmode set 10s #general",
        "/slowmode reset #general",
        "/slowmode reset",
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const channel = (options.getChannel("channel") || interaction.channel) as TextChannel;
        const time = options.getString("time");

        if (!interaction.guild) return;

        if (options.getSubcommand() === "set") {
            if (!channel.permissionsFor(interaction.client.user as unknown as GuildMember).has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: "I don't have permission to manage channels.", ephemeral: true });
            }

            if (!time) {
                return interaction.reply({ content: "Please provide a time.", ephemeral: true });
            }

            const timeRegex = /^(\d+)(s|m|h)$/;
            const timeMatch = time.match(timeRegex);

            if (!timeMatch) {
                return interaction.reply({ content: "Please provide a valid time.", ephemeral: true });
            }

            const timeNumber = parseInt(timeMatch[1]);
            const timeUnit = timeMatch[2];

            if (timeUnit === "s") {
                channel.setRateLimitPerUser(timeNumber);
            } else if (timeUnit === "m") {
                channel.setRateLimitPerUser(timeNumber * 60);
            } else if (timeUnit === "h") {
                channel.setRateLimitPerUser(timeNumber * 60 * 60);
            }

            return interaction.reply({ content: `Slowmode set to ${time} for ${channel}`, ephemeral: true });
        } else if (options.getSubcommand() === "reset") {
            if (!channel.permissionsFor(interaction.client.user as unknown as GuildMember).has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply({ content: "I don't have permission to manage channels.", ephemeral: true });
            }

            channel.setRateLimitPerUser(0);

            return interaction.reply({ content: `Slowmode reset for ${channel}`, ephemeral: true });
        }
    }
} as BaseCommand;