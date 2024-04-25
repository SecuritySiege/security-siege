import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder, AutocompleteInteraction, ClientEvents } from "discord.js";
import { BaseCommand } from "interfaces";

export const discordClientEvents: string[] = [
    "channelCreate",
    "channelDelete",
    "channelUpdate",
    "error",
    "guildCreate",
    "guildDelete",
    "guildIntegrationsUpdate",
    "guildMemberAdd",
    "guildMemberAvailable",
    "guildMemberRemove",
    "guildMemberUpdate",
    "guildUpdate",
    "inviteCreate",
    "inviteDelete",
    "message",
    "messageReactionAdd",
    "messageReactionRemove",
    "messageUpdate",
    "presenceUpdate",
    "ready",
    "roleCreate",
    "roleDelete",
    "roleUpdate",
    "userUpdate",
    "voiceStateUpdate",
];

export default {
    data: new SlashCommandBuilder()
        .setName("emit")
        .setDescription("Emit a Client Event")
        .addStringOption(option => option.setName("event").setDescription("The event to emit").setRequired(true).setAutocomplete(true)),
    category: "dev",        
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const event = options.getString("event") as string;

        interaction.client.emit(event);

        await interaction.reply({ content: `Emitted ${event}`, ephemeral: true });
    },

    async autocomplete(interaction: AutocompleteInteraction<"cached">) {
        const focused = interaction.options.getFocused();
        const filtered = discordClientEvents.filter(c => c.startsWith(focused));

        await interaction.respond(
            filtered.map((c) => ({ name: c, value: c }))
        )
    }
} as BaseCommand;