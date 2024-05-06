import { colors } from "config/colors";
import { CommandInteraction, SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { BaseCommand } from "interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get the avatar of a user or yourself")
        .addUserOption(option => option.setName("user").setDescription("The user to get the avatar of")),
    category: "info",
    usage: "/avatar [user]",
    examples: [
        "/avatar",
        "/avatar @user"
    ],
    async execute(interaction: CommandInteraction) {
        const user = ((interaction.options as CommandInteractionOptionResolver).getMember("user") || interaction.user) as GuildMember;

        const avatar = user.displayAvatarURL({ size: 128, forceStatic: true });

        const embed = new EmbedBuilder()
            .setColor(colors.CYAN)
            .setTitle(`Avatar of "${user.displayName}"`)
            .setImage(avatar);

        await interaction.reply({ embeds: [embed] });
    }
} as BaseCommand;