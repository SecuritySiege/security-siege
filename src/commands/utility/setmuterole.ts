import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, Role, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "interfaces";

import Logger from "classes/Logger";
import { MuteRole } from "models/GuildModel";

export default {
    data: new SlashCommandBuilder()
        .setName("setmuterole")
        .setDescription("Sets the mute role")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option => option.setName("role").setDescription("The role to set as the mute role").setRequired(true)),
    category: "utility",
    permissions: ["Administrator"],
    usage: "setmuterole <role>",
    examples: [
        "setmuterole @role"
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const role = options.getRole("role") as Role;

        const guild = interaction.guild;

        if (!guild) return;

        const mutedRole = await MuteRole.findOne({ guildId: guild.id });

        if (!mutedRole) {
            await MuteRole.create({
                guildId: guild.id,
                roleId: role.id
            });
        } else {
            mutedRole.roleId = role.id;
            await mutedRole.save();
        }

        Logger.info(`Set mute role to ${role.name} in ${guild.name}`);

        await interaction.reply({ content: `Set mute role to ${role.toString()}`, ephemeral: true });
    }
} as BaseCommand;