import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, EmbedBuilder, GuildMember, Role } from "discord.js";
import { BaseCommand } from "interfaces";

import Logger from "classes/Logger";
import { MuteRole } from "models/GuildModels";

export default {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mutes a user")
        .addUserOption(option => option.setName("user").setDescription("The user to mute").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for the mute").setRequired(true)),
    category: "moderation",
    usage: "mute <user> [reason]",
    permissions: ["KickMembers"],
    examples: [
        "mute @user reason"
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const member = options.getMember("user") as GuildMember;
        const reason = options.getString("reason") as string;

        if (!interaction.guild) return;

        const muteRole = await MuteRole.findOne({ guildId: interaction.guild.id });

        if (!muteRole) {
            Logger.error("No mute role found for guild " + interaction.guildId);
            await interaction.reply({
                content: "No mute role found for this guild",
                ephemeral: true
            });
            return;
        }

        if (member.roles.cache.has(muteRole.roleId)) {
            await interaction.reply({
                content: "User is already muted",
                ephemeral: true
            });
            return;
        }

        await member.roles.add(interaction.guild.roles.cache.get(muteRole.roleId) as Role);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("User Muted")
            .setDescription(`**User:** <@${member.id}>\n**Reason:** ${reason}`)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
} as BaseCommand;