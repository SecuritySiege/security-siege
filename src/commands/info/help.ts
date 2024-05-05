import { CommandInteraction, AutocompleteInteraction, GuildMember, APIEmbedField, RestOrArray } from "discord.js";
import { BaseCommand } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { colors } from "../../config/colors";
import { config } from "config/config";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of all commands from their categories.")
        .addStringOption(option => option.setName("category").setDescription("The category you want to get help with.").setAutocomplete(true))
        .addStringOption(option => option.setName("command").setDescription("The command you want to get help with.").setAutocomplete(true)),
    category: "info",
    usage: "/help [command]",
    examples: [
        "/help",
        "/help ping"
    ],
    async execute(interaction: CommandInteraction): Promise<void> {
        const client = interaction.client as BaseClient;
        const commandName = interaction.options.get("command")?.value as string;
        const category = interaction.options.get("category")?.value as string;

        if (category) {
            if (!config.ownerIDs.includes(interaction.user.id)) {
                await interaction.reply({ content: "You are not allowed to view that category.", ephemeral: true});
                return;
            }

            const commands = client.commands.filter((c) => c.category === category);

            if (!commands.size) {
                await interaction.reply({ content: "That category does not exist.", ephemeral: true });
                return;
            }

            const fields = commands.map((c) => ({
                name: c.data.name,
                value: `\`${c.data.description}\``,
                inline: true
            }));

            const embed = new EmbedBuilder()
                .setColor(colors.CYAN)
                .setTitle(`Help for "${category}"`)
                .addFields(fields)
                .setFooter({ text: `Command by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (commandName) {
            const command = client.commands.get(commandName);

            if (!command) {
                await interaction.reply({ content: "That command does not exist.", ephemeral: true });
                return;
            }

            if (command.category == "dev" && !config.ownerIDs.includes(interaction.user.id)) {
                await interaction.reply({ content: "You are not allowed to view that command.", ephemeral: true });
                return;
            }

            let fields: RestOrArray<APIEmbedField> = [
                {
                    name: "Description",
                    value: `\`${command.data.description}\``,
                    inline: true
                },
                {
                    name: "Category",
                    value: `\`${command.category}\``
                }
            ];

            if (command.usage) {
                fields.push(
                    {
                        name: "Usage",
                        value: `\`${command.usage}\``,
                        inline: true
                    }
                )
            }

            if (command.examples) {
                fields.push(
                    {
                        name: "Examples",
                        value: `\`${command.examples.join("`\n`")}\``,
                        inline: true
                    }
                )
            }

            const embed = new EmbedBuilder()
                .setColor(colors.CYAN)
                .setTitle(`Help for "${command.data.name}"`)
                .addFields(fields)
                .setFooter({ text: `Command by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const categories = client.commands.map((c) => c.category);
        const uniqueCategories = [...new Set(categories)];

        const fields = uniqueCategories.map((c) => ({
            name: `${c.charAt(0).toUpperCase() + c.slice(1)}:`,
            value: `\`${client.commands.filter((cmd) => cmd.category === c).size}\``,
            inline: true
        }));

        const embed = new EmbedBuilder()
            .setColor(colors.CYAN)
            .setTitle("Help Categories")
            .addFields(fields)
            .setFooter({ text: `Command by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        return;
    },

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        if (interaction.options.get("category")) {
            const commands = [...new Set((interaction.client as BaseClient).commands.map((c) => c.category))];

            const focused = interaction.options.getFocused();
            const filtered = commands.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }

        if (interaction.options.get("command")) {
            const commands = (interaction.client as BaseClient).commands.map((c) => c.data.name);

            const focused = interaction.options.getFocused();
            const filtered = commands.filter(c => c.startsWith(focused));

            await interaction.respond(
                filtered.map((c) => ({ name: c, value: c }))
            )
        }
    }
} as BaseCommand;