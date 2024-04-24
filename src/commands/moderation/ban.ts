import { SlashCommandBuilder, EmbedBuilder, GuildMember, ActionRowBuilder, ButtonBuilder, CommandInteraction, CommandInteractionOptionResolver, ButtonStyle, GuildMemberRoleManager, ComponentType, Guild } from "discord.js";
import { BaseCommand } from "../../interfaces";
import { colors } from "../../config/colors";
import { TempBanModel } from "../../models/TempBanModel";
import ms from "ms";
import Logger from "../../classes/Logger";

export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user.")
        .addSubcommand(subcommand =>
            subcommand.setName("permanent")
                .setDescription("Ban a user permanently.")
                .addUserOption(option => option.setName("user").setDescription("The user you want to ban.").setRequired(true))
                .addStringOption(option => option.setName("reason").setDescription("The reason for banning the user."))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("temporary")
                .setDescription("Ban a user temporarily.")
                .addUserOption(option => option.setName("user").setDescription("The user you want to ban.").setRequired(true))
                .addStringOption(option => option.setName("duration").setDescription("The duration of the ban.").setRequired(true))
                .addStringOption(option => option.setName("reason").setDescription("The reason for banning the user."))
        ),
    category: "moderation",
    usage: "/ban permanent @user [reason] | /ban temporary @user duration [reason]",
    examples: [
        "/ban permanent @user",
        "/ban permanent @user reason",
        "/ban temporary @user 1d",
        "/ban temporary @user 1d reason"
    ],
    permissions: ["BanMembers"],
    async execute(interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getMember("user") as GuildMember;
        const reason = options.getString("reason") || "No reason provided.";

        if (!interaction.guild?.available) return;

        if (!user) {
            await interaction.reply({
                content: "Please provide a user.",
                ephemeral: true
            });
            return;
        }

        if (!user.bannable) {
            await interaction.reply({
                content: "I can't ban this user.",
                ephemeral: true
            });
            return;
        }

        if ((interaction.member?.roles as GuildMemberRoleManager).highest.comparePositionTo(user.roles.highest) <= 0) {
            await interaction.reply({
                content: "You can't ban a user with a higher or equal role.",
                ephemeral: true
            });
            return;
        }

        if (interaction.user.id === user.id) {
            await interaction.reply({
                content: "You can't ban yourself.",
                ephemeral: true
            });
            return;
        }

        if (user.id === interaction.client.user?.id) {
            await interaction.reply({
                content: "I can't ban myself.",
                ephemeral: true
            });
            return;
        }

        if (options.getSubcommand() === "permanent") {
            const embed = new EmbedBuilder()
                .setTitle("Ban Confirmation")
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
                    }
                ])
                .setColor(colors.RED);

            const confirmButton = new ButtonBuilder()
                .setCustomId("ban:confirm:perm")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId("ban:cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Primary);

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(cancelButton, confirmButton);

            await interaction.reply({ embeds: [embed], components: [actionRow] });

            let collector = interaction.channel?.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: ms("30s")
            });

            collector?.on("collect", async buttonInteraction => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({
                        content: "You can't interact with this button.",
                        ephemeral: true
                    });
                    return;
                }

                if (buttonInteraction.customId === "ban:confirm:perm") {
                    await buttonInteraction.deferReply();
                    const embed = new EmbedBuilder()
                        .setTitle("User Banned")
                        .setColor("Green")
                        .addFields([
                            {
                                name: "User",
                                value: user.toString()
                            },
                            {
                                name: "Moderator",
                                value: interaction.user.toString()
                            },
                            {
                                name: "Reason",
                                value: reason
                            }
                        ]);

                    await user.ban({ reason: reason });

                    await buttonInteraction.editReply({
                        embeds: [embed]
                    });
                    return;
                } else if (buttonInteraction.customId === "ban:cancel") {
                    await buttonInteraction.deferReply();
                    await buttonInteraction.editReply({
                        content: "Ban has been cancelled."
                    });
                    return;
                }
            });
        } else if (options.getSubcommand() === "temporary") {
            const duration = options.getString("duration") as string;

            const embed = new EmbedBuilder()
                .setTitle("Ban Confirmation")
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
                        name: "Duration",
                        value: duration,
                        inline: true
                    }
                ])
                .setColor(colors.RED);

            const confirmButton = new ButtonBuilder()
                .setCustomId("ban:confirm:temp")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId("ban:cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Primary);

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(cancelButton, confirmButton);

            await interaction.reply({ embeds: [embed], components: [actionRow] });

            let collector = interaction.channel?.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: ms("30s")
            });

            collector?.on("collect", async buttonInteraction => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({
                        content: "You can't interact with this button.",
                        ephemeral: true
                    });
                    return;
                }

                if (buttonInteraction.customId === "ban:confirm:temp") {
                    await buttonInteraction.deferReply();

                    await TempBanModel.create({
                        guildID: (interaction.guild as Guild).id,
                        user: {
                            id: user.id,
                            username: user.user.username
                        },
                        moderator: {
                            id: interaction.user.id,
                            username: interaction.user.username
                        },
                        reason: reason,
                        duration: {
                            at: Date.now(),
                            expires: Date.now() + ms(duration)
                        }
                    });

                    const embed = new EmbedBuilder()
                        .setTitle("User Banned")
                        .setColor("Green")
                        .addFields([
                            {
                                name: "User",
                                value: user.toString()
                            },
                            {
                                name: "Moderator",
                                value: interaction.user.toString()
                            },
                            {
                                name: "Reason",
                                value: reason
                            },
                            {
                                name: "Duration",
                                value: duration
                            }
                        ])

                    await user.ban({ reason: reason });

                    await buttonInteraction.editReply({
                        embeds: [embed]
                    });

                    setTimeout(async () => {
                        await user.guild.members.unban(user.id);
                        await TempBanModel.deleteOne({ guildID: user.guild.id, user: { id: user.id } });
                        Logger.info(`Unbanned ${user.user.tag} from ${user.guild.name} due to the expiration of their temporary ban.`);
                    }, ms(duration));

                    return;
                } else if (buttonInteraction.customId === "ban:cancel") {
                    await buttonInteraction.deferReply();
                    await buttonInteraction.editReply({
                        content: "Ban has been cancelled."
                    });
                    return;
                }
            });

            collector?.on("end", async () => {
                await interaction.editReply({
                    content: "Ban confirmation has expired.",
                    components: []
                });
                return;
            });
        }
    }
} as BaseCommand;