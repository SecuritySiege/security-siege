import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, EmbedBuilder, GuildMember, Role, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "interfaces";

import Logger from "classes/Logger";
import { MuteRole } from "models/GuildModels";

export default {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmutes a user")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false)
        .addUserOption(option => option.setName("user").setDescription("The user to unmute").setRequired(true)),
    category: "moderation",
    permissions: ["KickMembers"],
    usage: "unmute <user>",
    examples: [
        "unmute @user"
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getMember("user") as GuildMember;

        if (!interaction.guild) return;

        if (!user) {
            return interaction.reply({ content: "Please provide a valid user", ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: "You cannot unmute yourself", ephemeral: true });
        }

        const muteRole = await MuteRole.findOne({ guildId: interaction.guildId });

        if (!muteRole) {
            Logger.error("No mute role found for guild " + interaction.guildId);
            await interaction.reply({
                content: "No mute role found for this guild",
                ephemeral: true
            });
            return;
        }

        if (!user.roles.cache.has(muteRole.roleId)) {
            return interaction.reply({ content: "User is not muted", ephemeral: true });
        }

        await user.roles.remove(interaction.guild.roles.cache.get(muteRole.roleId) as Role);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("User Unmuted")
            .setDescription(`**${user.user.tag}** has been unmuted by **${interaction.user.tag}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
} as BaseCommand;