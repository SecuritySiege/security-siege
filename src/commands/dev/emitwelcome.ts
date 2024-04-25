import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, AutocompleteInteraction, ClientEvents, GuildMember } from "discord.js";
import { BaseCommand } from "interfaces";

export default {
    data: new SlashCommandBuilder()
        .setName("emitwelcome")
        .setDescription("Emit a welcome event")
        .addUserOption(user => user.setName("member").setDescription("The member to test").setRequired(true)),
    category: "dev",        
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const member = options.getMember("member") as GuildMember;

        interaction.client.emit("guildMemberAdd", member);

        await interaction.reply({ content: `Emitted welcome event`, ephemeral: true });
    }
} as BaseCommand;