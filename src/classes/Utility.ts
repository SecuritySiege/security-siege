import { Guild, TextChannel } from "discord.js";
import BaseClient from "./Client";

export default class Utility {
    private client!: BaseClient<true>;

    static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static generateSpecialId(): string {
        const randomString = Math.random().toString(36).substring(2, 10);

        return randomString.toUpperCase();
    }


    static formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    static async lockChannel(channel: TextChannel): Promise<void> {
        channel.permissionOverwrites.edit(channel.guild.id, {
            SendMessages: false,
            AddReactions: false,
            ViewChannel: false
        });
    }

    static async unlockChannel(channel: TextChannel): Promise<void> {
        channel.permissionOverwrites.edit(channel.guild.id, {
            SendMessages: true,
            AddReactions: true,
            ViewChannel: true
        });
    }

    static async getMemberCount(guild: Guild) {
        const members = await guild.members.fetch();
        
        // Check if the number ends 1, 2, or 3
        const lastDigit = members.size % 10;

        let memberCount = members.size.toString();

        if (lastDigit === 1) {
            memberCount += "st";
        } else if (lastDigit === 2) {
            memberCount += "nd";
        } else if (lastDigit === 3) {
            memberCount += "rd";
        }
        else {
            memberCount += "th";
        }

        return memberCount;
    }
}