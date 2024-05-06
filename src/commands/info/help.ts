import { CommandInteraction, AutocompleteInteraction, APIEmbedField, RestOrArray, CommandInteractionOptionResolver } from "discord.js";
import { BaseCommand } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { colors } from "../../config/colors";
import { config } from "config/config";
import Utility from "classes/Utility";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Check out the commands for Security Siege!")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("all")
                .setDescription("Gets all the commands in their categories.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("command")
                .setDescription("Finds a command")
                .addStringOption((command) =>
                    command
                        .setName("command")
                        .setDescription("The command you need help with")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("category")
                .setDescription("Finds a category")
                .addStringOption((category) =>
                    category
                        .setName("category")
                        .setDescription("The category you need help with")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ),
    category: "info",
    usage: "/help <command | category | all> <command | category>",
    examples: [
        "/help",
        "/help all",
        "/help command <command>",
        "/help category <category>"
    ],
    async execute(interaction: CommandInteraction): Promise<void> {
        const client = interaction.client as BaseClient,
            options = interaction.options as CommandInteractionOptionResolver,
            commandName = options.getString("command"),
            category = options.getString("category"),
            subcommand = options.getSubcommand();

        if (subcommand === "all") {
            const commands = client.commands.map((command) => command);
            const categories = [...new Set(client.commands.map((cat) => cat.category))];
            let fields: RestOrArray<APIEmbedField> = [];

            for (const category of categories) {
                fields.push({
                    name: Utility.capitalize(category),
                    value: commands
                        .filter((command) => command.category === category)
                        .map((command) => `\`${command.data.name}\``)
                        .join(", "),
                    inline: true
                })
            }

            if (!config.ownerIDs.includes(interaction.user.id)) {
                fields = fields.filter((field) =>
                    field.name !== "Dev"
                )
            }

            const embed = new EmbedBuilder()
                .setTitle("Need Help?")
                .setDescription("Here are a list of categories with their commands! For more information, use the `/help command help` command.")
                .setColor(colors.CYAN)
                .addFields(fields)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (subcommand === "command") {
            const command = client.commands.get(commandName as string);

            if (!command) {
                await interaction.reply({ content: "That command does not exist!", ephemeral: true });
                return;
            }

            if (command.category === "dev" && !config.ownerIDs.includes(interaction.user.id)) {
                await interaction.reply({ content: "You do not have permission to view this command!", ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Help for "${command.data.name}"`)
                .setDescription(`**Description:** \`${command.data.description}\``)
                .setColor(colors.CYAN)
                .addFields([
                    {
                        name: "Category",
                        value: `\`${Utility.capitalize(command.category)}\``,
                        inline: true
                    },
                    {
                        name: "Usage",
                        value: `\`${command.usage}\``,
                        inline: true
                    },
                    {
                        name: "Examples",
                        value: `\`${command.examples?.join("`\n`")}\`` || "\`None\`",
                        inline: true
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (subcommand === "category") {
            const commands = client.commands.filter((command) => command.category === category).map(c => c);

            if (!commands || !category) {
                await interaction.reply({ content: "That category does not exist!", ephemeral: true });
                return;
            }

            if (category === "dev" && !config.ownerIDs.includes(interaction.user.id)) {
                await interaction.reply({ content: "You do not have permission to view this category!", ephemeral: true });
                return;
            }

            const fields: RestOrArray<APIEmbedField> = [];

            for (const command of commands) {
                fields.push({
                    name: command.data.name,
                    value: `\`${command.data.description}\``,
                    inline: true
                })
            }

            const embed = new EmbedBuilder()
                .setTitle(`Help for "${Utility.capitalize(category)}"`)
                .setDescription(`Here are all the commands in the "${Utility.capitalize(category)}" category! For more information, use the \`/help command help\` command.`)
                .setColor(colors.CYAN)
                .addFields(fields)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }
    },

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const options = interaction.options as CommandInteractionOptionResolver,
            command = options.getString("command"),
            category = options.getString("category"),
            client = interaction.client as BaseClient;

        if (command) {
            const commands = client.commands.map((c) => c.data.name);

            const focused = interaction.options.getFocused();
            const filtered = commands.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }

        if (category) {
            const categories = [...new Set(
                client.commands.map((c) => c.category)
            )]

            const focused = interaction.options.getFocused();
            const filtered = categories.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }
    }
} as BaseCommand;