import { Client, IntentsBitField, Collection, Partials } from "discord.js";
import mongoose, { connect } from "mongoose";

import { BaseEvent, BaseCommand } from "../interfaces";

import CommandHandler from "./CommandHandler";
import EventHandler from "./EventHandler";

import "dotenv/config";
import { config } from "../config/config";
// import InteractionHandler from "./InteractionHandler";
import Logger from "./Logger";

export default class BaseClient<Ready extends boolean = boolean> extends Client<true> {
    public commands: Collection<string, BaseCommand> = new Collection();
    public events: Collection<string, BaseEvent> = new Collection();
    // public buttons: Collection<string, BaseButton> = new Collection();

    public config = config;

    public commandHandler: CommandHandler = new CommandHandler(this);
    public eventHandler: EventHandler = new EventHandler(this);
    // public interactionHandler: InteractionHandler = new InteractionHandler(this);

    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildPresences,
                IntentsBitField.Flags.GuildEmojisAndStickers,
                IntentsBitField.Flags.GuildInvites,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.DirectMessageReactions
            ],
            partials: [Partials.User, Partials.Channel, Partials.Message, Partials.GuildMember],
            allowedMentions: { parse: ["users", "roles"], repliedUser: true }
        });
    }

    public async start(): Promise<void> {
        await this.login(process.env.TOKEN);

        try {
            await this.commandHandler.loadCommands();
            await this.eventHandler.loadEvents();
            // await this.interactionHandler.loadButtons();
            await this.connectDatabase();
        } catch (error) {
            Logger.error((error as Error).stack as string);
        }
    }

    private async connectDatabase(): Promise<void> {
        await connect(this.config.mongoURI, { dbName: "security-siege" })
            .then(() => Logger.log("Connected to the database."))
            .catch((error) => Logger.error((error as Error).stack as string));
    }
}