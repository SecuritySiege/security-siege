import { CommandInteraction, Awaitable, ClientEvents, AutocompleteInteraction, PermissionResolvable, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import BaseClient from "../classes/Client";

export interface BaseEvent {
    name: keyof ClientEvents;
    once?: boolean;
    execute(client: BaseClient<true>, ...args: ClientEvents[keyof ClientEvents]): Awaitable<void>;
}

export interface BaseCommand {
    data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
        | Omit<SlashCommandSubcommandsOnlyBuilder, "addSubcommandGroup" | "addSubcommand">
        | Omit<SlashCommandOptionsOnlyBuilder, "addSubcommandGroup" | "addSubcommand">;
    category: string;
    usage?: string;
    examples?: string[];
    permissions?: PermissionResolvable[];
    execute(interaction: CommandInteraction): Awaitable<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<void>;
}
