import { readdirSync } from "fs";
import { join } from "path";

import BaseClient from "./Client";
import { BaseEvent } from "../interfaces";
import { ClientEvents } from "discord.js";

import Logger from "./Logger";

export default class EventHandler {
    public client: BaseClient<true>;
    
    public constructor(client: BaseClient<true>) {
        this.client = client;
    }

    public async loadEvents(): Promise<void> {
        const eventsFolder = join(__dirname, "..", "events");

        const eventFolders = readdirSync(eventsFolder);

        for (const folder of eventFolders) {
            const eventFiles = readdirSync(join(eventsFolder, folder)).filter(file => file.endsWith(".ts"));

            for (const file of eventFiles) {
                const event = (await import(join(eventsFolder, folder, file))).default as BaseEvent;

                this.client[event.once ? "once" : "on"](event.name, (...args: ClientEvents[keyof ClientEvents]) => event.execute(this.client, ...args));
                this.client.events.set(event.name, event);
                Logger.log(`Loaded event: ${event.name}`);
            }
        }

        await this.loadReadyEvent();
    }

    private async loadReadyEvent(): Promise<void> {
        this.client.events.get("ready")?.execute(this.client);
    }
}