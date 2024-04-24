import { CommandInteraction, CommandInteractionOptionResolver, Role, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

import { GuildModel } from "models/GuildModel";

export default {
    data: new SlashCommandBuilder()
        .setName("setmuterole")
        .setDescription("Sets the mute role for the server.")
        .addRoleOption(role => role.setName("role").setDescription("The mute role").setRequired(true)),
    category: "moderation",
    usage: "setmuterole <role>",
    examples: [
        "setmuterole @muted"
    ],
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const role = options.getRole("role") as Role;

        if (!role) {
            await interaction.reply({
                content: "That role does not exist in this server.",
                ephemeral: true
            })
            return;
        }

        const guild = GuildModel.findOne({ guildID: interaction.guild?.id });

        if (!guild) {
            console.log("Creating new GuildModel document...");
            const guildModel = new GuildModel({
                guildID: interaction.guild?.id,
                roles: {
                    muted: role.toString() as string
                }
            });
            await guildModel.save();
            console.log("New GuildModel document created.");

            await interaction.reply(`Mute role has been set to => ${role.toString()}`);
            return;
        }

        console.log("Updating existing GuildModel document...");
        const updatedGuild = await guild.findOneAndUpdate({ guildID: interaction.guild?.id }, {
            roles: { muted: role.toString() as string }
        });
        console.log("Existing GuildModel document updated.");
        await interaction.reply(`Mute role has been set to => ${role.toString()}`);
        return;

    }
} as BaseCommand;