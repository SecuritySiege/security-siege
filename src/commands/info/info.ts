import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
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
        const subcommand = options.getSubcommand();

        if (subcommand === "user") {
            const member = options.getMember("user") as GuildMember;
            const embed = new EmbedBuilder()
                .setColor(colors.CYAN)
                .setAuthor({ name: member.user.username, iconURL: member.displayAvatarURL() })
                .setThumbnail(member.displayAvatarURL())
                .addFields([
                    {
                        name: "User Info",
                        value: `ID: ${member.id}\nUsername: ${member.user.username}\nNickname: ${member.nickname || "None"}\nStatus: ${member.presence?.status || "Unknown"}`,
                    },
                    {
                        name: "Created At",
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`
                    },
                    {
                        name: "Joined At",
                        value: `<t:${Math.floor((member.joinedTimestamp || member.user.createdTimestamp) / 1000)}:R>`
                    },
                    {
                        name: "Roles",
                        value: member.roles.cache.map(role => role.toString()).join(", ")
                    }
                ]);

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "server") {
            const guild = interaction.guild;

            if (!guild) return;

            const embed = new EmbedBuilder()
                .setColor(colors.CYAN)
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(guild.iconURL())
                .addFields([
                    {
                        name: "Server Info",
                        value: `ID: ${guild.id}\nName: ${guild.name}\nOwner: ${(await guild.fetchOwner()).user.toString()}\nMember Count: ${guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: "Created At",
                        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`
                    },
                    {
                        name: "Roles",
                        value: guild.roles.cache.map(role => role.toString()).join(", ")
                    }
                ])

            await interaction.reply({ embeds: [embed] });
        }
    },
} as BaseCommand;