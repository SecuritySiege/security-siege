import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder } from "discord.js";
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
                .addIntegerOption(option =>
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
        ),
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

            let warning = WarnsModel.findOne(
                {
                    guild_id: interaction.guild?.id,
                    user: {
                        id: user.user.id,
                        username: user.user.username
                    }
                }
            )

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
                            id: Utility.generateSpecialId()
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

                
            }


        }
    }
} as BaseCommand;