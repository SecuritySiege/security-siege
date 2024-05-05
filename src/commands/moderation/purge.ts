import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, TextChannel, PermissionFlagsBits } from "discord.js";
import { BaseCommand } from "../../interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete a number of messages. (Includes other options)")
        .addSubcommand(subcommand =>
            subcommand.setName("messages")
                .setDescription("Delete a number of messages.")
                .addIntegerOption(option => option.setName("amount").setDescription("The number of messages you want to delete.").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("user")
                .setDescription("Delete messages from a user.")
                .addUserOption(option => option.setName("user").setDescription("The user you want to delete messages from.").setRequired(true))
                .addIntegerOption(option => option.setName("amount").setDescription("The number of messages you want to delete.").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName("bot")
                .setDescription("Delete messages from bots.")
                .addIntegerOption(option => option.setName("amount").setDescription("The number of messages you want to delete.").setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    category: "moderation",
    usage: "/purge [subcommand]",
    examples: [
        "/purge messages 10",
        "/purge user @user 10",
        "/purge bot 10"
    ],
    permissions: ["ManageMessages"],
    async execute(interaction: CommandInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver;

        const subcommand = options.getSubcommand();
        const amount = options.getInteger("amount");
        const user = options.getUser("user");

        if (!amount) {
            await interaction.reply({
                content: "Please provide an amount.",
                ephemeral: true
            });
            return;
        }

        if (amount < 1 || amount > 100) {
            await interaction.reply({
                content: "The amount must be between 1 and 100.",
                ephemeral: true
            });
            return;
        }

        if (subcommand === "messages") {
            await (interaction.channel as TextChannel).bulkDelete(amount, true);
        } else if (subcommand === "user") {
            if (!user) {
                await interaction.reply({
                    content: "Please provide a user.",
                    ephemeral: true
                });
                return;
            }

            await (interaction.channel as TextChannel).messages.fetch({ limit: amount }).then(messages => {
                const userMessages = messages.filter(m => m.author.id === user.id).map(m => m).slice(0, amount);
                (interaction.channel as TextChannel).bulkDelete(userMessages, true);
            });
        } else if (subcommand === "bot") {
            await (interaction.channel as TextChannel).messages.fetch({ limit: amount }).then(messages => {
                const botMessages = messages.filter(m => m.author.bot).map(m => m).slice(0, amount);
                (interaction.channel as TextChannel).bulkDelete(botMessages, true);
            });
        }

        await interaction.reply({
            content: `Deleted ${amount} messages.`,
            ephemeral: true
        });
    }
} as BaseCommand