import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, GuildMemberRoleManager, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "../../interfaces";
import { colors } from "../../config/colors";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option.setName("user").setDescription("The user you want to kick.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for kicking the user.")),
    category: "moderation",
    usage: "/kick @user [reason]",
    examples: [
        "/kick @user",
        "/kick @user reason"
    ],
    permissions: ["KickMembers"],
    async execute(interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver;

        const user = options.getMember("user") as GuildMember;
        const reason = options.getString("reason") || "No reason provided.";

        if (!user) {
            await interaction.reply({
                content: "Please provide a user.",
                ephemeral: true
            });
            return;
        }

        if ((interaction.member?.roles as GuildMemberRoleManager).highest.comparePositionTo(user.roles.highest) <= 0) {
            await interaction.reply({
                content: "You can't kick a user with a higher or equal role.",
                ephemeral: true
            });
            return;
        }

        if (!user.kickable) {
            await interaction.reply({
                content: "I can't kick this user.",
                ephemeral: true
            });
            return;
        }

        if (interaction.user.id === user.id) {
            await interaction.reply({
                content: "You can't kick yourself.",
                ephemeral: true
            });
            return;
        }

        if (user.id === interaction.client.user?.id) {
            await interaction.reply({
                content: "I can't kick myself.",
                ephemeral: true
            });
            return;
        }

        await user.kick(reason);

        const embed = new EmbedBuilder()
            .setTitle("User Kicked")
            .addFields([
                {
                    name: "User",
                    value: user.toString(),
                    inline: true
                },
                {
                    name: "Moderator",
                    value: interaction.user.toString(),
                    inline: true
                },
                {
                    name: "Reason",
                    value: reason,
                    inline: true
                },
                {
                    name: "Date",
                    value: new Date().toDateString(),
                    inline: true
                }
            ])
            .setColor(colors.RED);

        await interaction.reply({ embeds: [embed] });
    }
} as BaseCommand;