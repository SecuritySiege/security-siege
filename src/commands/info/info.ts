import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";
import { colors } from "../../config/colors";

export default {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information about the bot.")
        .addSubcommand(subcommand =>
            subcommand.setName("user")
                .setDescription("Get information about a user.")
                .addUserOption(option => option.setName("user").setDescription("The user you want to get information about.").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("server")
                .setDescription("Get information about the server.")
        ),
    category: "info",
    usage: "/info [subcommand]",
    examples: [
        "/info user @user",
        "/info server"
    ],
    async execute(interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver;
        if (options.getSubcommand() === "user") {
            const user = options.getUser("user");

            if (!user) {
                await interaction.reply({
                    content: "Please provide a user.",
                    ephemeral: true
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("User Information")
                .addFields([
                    {
                        name: "Username",
                        value: `\`\`\`${user.username}\`\`\``,
                        inline: true
                    },
                    {
                        name: "ID",
                        value: `\`\`\`${user.id}\`\`\``,
                        inline: true
                    },
                    {
                        name: "Bot",
                        value: `\`\`\`${user.bot ? "Yes" : "No"}\`\`\``,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `\`\`\`${user.createdAt.toDateString()}\`\`\``,
                        inline: true
                    }
                ])
                .setColor(colors.CYAN)
                .setThumbnail(user.displayAvatarURL({ forceStatic: true }));

            await interaction.reply({ embeds: [embed] });
        } else if (options.getSubcommand() === "server") {
            const guild = interaction.guild!;

            const embed = new EmbedBuilder()
                .setTitle("Server Information")
                .addFields([
                    {
                        name: "Name",
                        value: `\`\`\`${guild.name}\`\`\``,
                        inline: true
                    },
                    {
                        name: "ID",
                        value: `\`\`\`${guild.id}\`\`\``,
                        inline: true
                    },
                    {
                        name: "Owner",
                        value: `<@${guild.ownerId}>`,
                        inline: true
                    },
                    {
                        name: "Members",
                        value: `\`\`\`${guild.memberCount}\`\`\``,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `\`\`\`${guild.createdAt.toDateString()}\`\`\``,
                        inline: true
                    }
                ])
                .setColor(colors.CYAN);

            await interaction.reply({ embeds: [embed] });
        }
    },
} as BaseCommand;