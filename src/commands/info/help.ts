import { CommandInteraction, AutocompleteInteraction, GuildMember } from "discord.js";
import { BaseCommand } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { colors } from "../../config/colors";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of all commands from their categories.")
        .addStringOption(option => option.setName("command").setDescription("The command you want to get help with.").setAutocomplete(true)),
    category: "info",
    usage: "/help [command]",
    examples: [
        "/help",
        "/help ping"
    ],
    async execute(interaction: CommandInteraction): Promise<void> {
        const command = interaction.options.get("command")?.value as string | undefined;

        if (command) {
            const cmd = (interaction.client as BaseClient).commands.get(command);
            if (!cmd) {
                await interaction.reply({
                    content: "That command doesn't exist.",
                    ephemeral: true
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Help for ${cmd.data.name}`)
                .setDescription(`**Description:** \`${cmd.data.description}\``)
                .addFields([
                    {
                        name: "Usage",
                        value: `\`${cmd.usage}\`` || "No usage."
                    },
                    {
                        name: "Examples",
                        value: (cmd.examples || []).map(e => `\`${e}\``).join("\n") || "No examples."
                    }
                ])
                .setColor(colors.CYAN);

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const commands = (interaction.client as BaseClient).commands

        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription("Here is a list of all commands.")
            .setColor(colors.CYAN);

        for (const category of [...new Set(commands.map(c => c.category))]) {
            const cmds = commands.filter(c => c.category === category);
            if (category === "admin" && !(interaction.member as GuildMember).permissions.has("Administrator")) {
                continue;
            } else {
                if (category === "admin") {
                    embed.addFields([
                        {
                            name: category.charAt(0).toUpperCase() + category.slice(1),
                            value: cmds.map(c => `**${c.data.name}**`).join(", ")
                        }
                    ])
                    continue;
                }
            }

            embed.addFields([
                {
                    name: category.charAt(0).toUpperCase() + category.slice(1),
                    value: cmds.map(c => `**${c.data.name}**`).join(", ")
                }
            ])
        }

        await interaction.reply({ embeds: [embed] });
    },

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const commands = (interaction.client as BaseClient).commands.map((c) => c.data.toJSON().name);

        const focused = interaction.options.getFocused();
        const filtered = commands.filter(c => c.startsWith(focused));

        await interaction.respond(
            filtered.map((c) => ({ name: c, value: c }))
        )
    }
} as BaseCommand;