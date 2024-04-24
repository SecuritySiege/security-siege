import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import Logger from "../../classes/Logger";

export default {
    name: "ready",
    once: true,
    async execute(client: BaseClient<true>): Promise<void> {
        Logger.log(`Logged in as ${client.user.tag}`);
    }
} as BaseEvent;