import { Guild, GuildMember, PermissionResolvable } from "discord.js";
import BaseClient from "./Client";

export default class Utility {
    private client!: BaseClient<true>;

    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}