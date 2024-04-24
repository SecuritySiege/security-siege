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

    /**
         * Generates a special id that can be saved for different purposes.
         * The length of the id is 8 characters.
         * @returns {string} The generated id.
         */
    static generateSpecialId(): string {
        // Generate a random string of 8 characters.
        const randomString = Math.random().toString(36).substring(2, 10);

        // Convert the random string to uppercase.
        return randomString.toUpperCase();
    }


    static formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}