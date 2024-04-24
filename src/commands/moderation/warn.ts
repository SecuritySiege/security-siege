import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../interfaces";

import Logger from "../../classes/Logger";
import { WarnsModel, Warn } from "../../models/WarnsModel";

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
        "warn remove @User#0001 1",
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
                await interaction.reply({
                    content: "Please provide a user.",
                    ephemeral: true
                });
                return;
            }

            if (user.id === interaction.user.id) {
                await interaction.reply({
                    content: "You can't warn yourself.",
                    ephemeral: true
                });
                return;
            }

            if (user.id === interaction.client.user?.id) {
                await interaction.reply({
                    content: "I can't warn myself.",
                    ephemeral: true
                });
                return;
            }

            const warn = new Warn({
                guildID: interaction.guildId as string,
                userID: user.id,
                moderatorID: interaction.user.id,
                reason
            });

            await warn.save().catch(error as Error => {
                Logger.error("WARN_SAVE_ERR:", error);
                return interaction.reply({
                    content: "An error occurred while saving the warning.",
                    ephemeral: true
                });
            });

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("User Warned")
                .addFields([
                    { name: "User", value: user.toString() },
                    { name: "Moderator", value: interaction.user.toString() },
                    { name: "Reason", value: reason }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
} as BaseCommand;