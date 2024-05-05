import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, CommandInteractionOptionResolver, Guild, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "../../interfaces";
import { colors } from "../../config/colors";

export default {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user.")
        .addStringOption(option => option.setName("user-id").setDescription("The user you want to unban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for unbanning the user."))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    category: "moderation",
    usage: "/unban <userID> [reason]",
    examples: [
        "/unban 123456789012345678",
        "/unban 123456789012345678 Spamming in chat."
    ],
    permissions: ["BanMembers"],
    async execute(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) return;

        const options = interaction.options as CommandInteractionOptionResolver;

        const userID = options.getString("user-id", true);
        const reason = options.getString("reason") || "No reason provided.";

        interaction.guild.bans.fetch().then(async bans => {
            const user = bans.find(ban => ban.user.id === userID);

            if (!user) {
                await interaction.reply({ content: "User is not banned.", ephemeral: true });
                return;
            }

            await (interaction.guild as Guild).bans.remove(user.user, reason);

            const embed = new EmbedBuilder()
                .setColor(colors.GREEN)
                .setTitle("User Unbanned")
                .addFields([
                    { name: "User", value: `\`${user.user.toString()}\`` },
                    { name: "Moderator", value: `\`${interaction.user.toString()}\`` },
                    { name: "Reason", value: reason }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        });
    }
} as BaseCommand;