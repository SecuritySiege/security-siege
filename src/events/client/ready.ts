import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import Logger from "../../classes/Logger";
import { ActivityType } from "discord.js";

export default {
    name: "ready",
    once: true,
    async execute(client: BaseClient<true>): Promise<void> {
        Logger.log(`Logged in as ${client.user.username}!`);

        client.user.setPresence({
            activities: [
                {
                    name: "Owen coding me :D",
                    type: ActivityType.Watching
                }
            ],
            status: "online"
        })

    }
} as BaseEvent;