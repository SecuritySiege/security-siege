import { readdirSync } from "fs";
import { join } from "path";

import { REST, Routes } from "discord.js";
import BaseClient from "./Client";
import { BaseCommand } from "../interfaces";

import Logger from "./Logger";

import "dotenv/config";

export default class CommandHandler {
    public client: BaseClient<true>;

    public constructor(client: BaseClient<true>) {
        this.client = client;
    }

    public async loadCommands(): Promise<void> {
        const commands = [];

        const commandsFolder = join(__dirname, "..", "commands");

        const commandFolders = readdirSync(commandsFolder);

        for (const folder of commandFolders) {
            const commandFiles = readdirSync(join(commandsFolder, folder)).filter(file => file.endsWith(".ts"));

            for (const file of commandFiles) {
                const command = (await import(join(commandsFolder, folder, file))).default as BaseCommand;

                commands.push(command.data.toJSON());
                

                this.client.commands.set(command.data.name, command);

                Logger.log(`Loaded command: ${command.data.name}`);
            }
        }

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

        try {
            Logger.log("Started refreshing application (/) commands.");

            await rest.put(Routes.applicationGuildCommands(this.client.application.id, process.env.GUILD_ID!), { body: commands });

            Logger.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            Logger.error((error as Error).stack as string);
        }
    }
}