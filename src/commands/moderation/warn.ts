import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "../../interfaces";

import Logger from "../../classes/Logger";
import { WarnsModel, Warn } from "../../models/WarnsModel";
import Utility from "../../classes/Utility";
import { colors } from "../../config/colors";

export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user, remove a recent warning or view a user's warnings.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Warn a user.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to warn.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("reason")
                        .setDescription("The reason for the warning.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Remove a warning from a user.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to remove the warning from.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("id")
                        .setDescription("The ID of the warning to remove.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("view")
                .setDescription("View a user's warnings.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to view the warnings of.")
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    category: "Moderation",
    usage: "warn <add | remove | view> [user] [reason | id]",
    examples: [
        "warn add @User#0001 Spamming",
        "warn remove @User#0001 12345678",
        "warn view @User#0001"
    ],
    permissions: ["ManageMessages"],
    async execute(interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        if (subcommand === "add") {
            const user = options.getMember("user") as GuildMember;
            const reason = options.getString("reason") as string;

            if (!user) {
                await interaction.reply("Please provide a user.");
                return;
            }

            if (!reason) {
                await interaction.reply("Please provide a reason.");
                return;
            }

            const warning = await WarnsModel.findOne({
                guild_id: interaction.guild?.id,
                "user.id": user.user.id
            });

            if (!warning) {
                const warnModel = new WarnsModel({
                    guild_id: interaction.guild?.id,
                    user: {
                        id: user.user.id,
                        username: user.user.username
                    },
                    warnings: [
                        {
                            moderator: {
                                id: interaction.user.id,
                                username: interaction.user.username
                            },
                            reason: reason,
                            timestamp: Date.now(),
                            warn_id: Utility.generateSpecialId()
                        }
                    ]

                })

                await warnModel.save();

                const embed = new EmbedBuilder()
                    .setTitle("Warn added")
                    .setDescription(`Added a warning to ${user.user.username}.`)
                    .setColor(colors.CYAN)
                    .addFields([
                        {
                            name: "Moderator",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                        },
                        {
                            name: "Reason",
                            value: reason,
                            inline: true
                        },
                        {
                            name: "Timestamp",
                            value: Utility.formatTimestamp(Date.now()),
                            inline: true
                        }
                    ])
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                try {
                    await user.send(
                        `You have been warned in ${interaction.guild?.name} for ${reason}.`
                    );
                } catch (error) {
                    Logger.error((error as Error))
                    await interaction.reply("Failed to send a message to the user.");
                }

            } else {
                warning.warnings.push({
                    moderator: {
                        id: interaction.user.id,
                        username: interaction.user.username
                    },
                    reason: reason,
                    timestamp: Date.now(),
                    warn_id: Utility.generateSpecialId()
                });

                await warning.save();

                const embed = new EmbedBuilder()
                    .setTitle("Warn added")
                    .setDescription(`Added a warning to ${user.user.username}.`)
                    .setColor(colors.CYAN)
                    .addFields([
                        {
                            name: "Moderator",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                        },
                        {
                            name: "Reason",
                            value: reason,
                            inline: true
                        },
                        {
                            name: "Timestamp",
                            value: Utility.formatTimestamp(Date.now()),
                            inline: true
                        }
                    ])
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        }

        if (subcommand === "remove") {
            const user = options.getMember("user") as GuildMember;
            const id = options.getString("id") as string;

            if (!user) {
                await interaction.reply("Please provide a user.");
                return;
            }

            if (!id) {
                await interaction.reply("Please provide a warning ID.");
                return;
            }

            const warning = await WarnsModel.findOne({
                guild_id: interaction.guild?.id,
                "user.id": user.user.id
            });

            if (!warning) {
                await interaction.reply("This user has no warnings.");
                return;
            }

            const warn = warning.warnings.find(warn => warn.warn_id === id);

            if (!warn) {
                await interaction.reply("This user has no warnings with that ID.");
                return;
            }

            warning.warnings = warning.warnings.filter(warn => warn.warn_id !== id);

            await warning.save();

            const embed = new EmbedBuilder()
                .setTitle("Warning removed")
                .setDescription(`Removed a warning from ${user.user.username}.`)
                .setColor(colors.CYAN)
                .addFields([
                    {
                        name: "Moderator",
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    },
                    {
                        name: "Warning ID",
                        value: id.toString(),
                        inline: true
                    },
                    {
                        name: "Timestamp",
                        value: Utility.formatTimestamp(Date.now()),
                        inline: true
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            try {
                await user.send(
                    `Your warning with ID: ${id} has been removed from **${interaction.guild?.name}**.`
                );
            } catch (error) {
                Logger.error((error as Error))
                await interaction.reply("Failed to send a message to the user.");
            }
        }

        if (subcommand === "view") {
            const user = options.getMember("user") as GuildMember;
            const warnings = await WarnsModel.findOne({
                guild_id: interaction.guild?.id,
                "user.id": user.user.id
            });

            if (!warnings) {
                await interaction.reply("This user has no warnings.");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Warnings")
                .setDescription(`Warnings for ${user.user.username}:`)
                .setColor(colors.CYAN)
                .addFields(
                    warnings.warnings.map(warn => ({
                        name: `ID: ${warn.warn_id}`,
                        value: `Moderator: <@${warn.moderator.id}>\nReason: ${warn.reason}\nTimestamp: ${Utility.formatTimestamp(warn.timestamp)}`,
                        inline: true
                    }))
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
} as BaseCommand;