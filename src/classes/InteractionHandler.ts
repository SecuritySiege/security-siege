// TODO: Implement interaction handler

// import { readdirSync } from "fs";
// import { join } from "path";
// import BaseClient from "./Client";
// // import { BaseButton } from "../interfaces";
// import { ButtonInteraction } from "discord.js";
// import Logger from "./Logger";

// export default class InteractionHandler {
//     private client: BaseClient<true>;

//     constructor(client: BaseClient<true>) {
//         this.client = client;
//     }

//     public async loadButtons(): Promise<void> {
//         const buttonPath = join(__dirname, "..", "interactions", "buttons");

//         readdirSync(buttonPath).forEach(async (dir) => {
//             const buttonFiles = readdirSync(`${buttonPath}/${dir}`).filter((file) => file.endsWith(".ts"));

//             // for (const file of buttonFiles) {
//             //     const button = (await import(`${buttonPath}/${dir}/${file}`)).default as BaseButton;

//             //     this.client.buttons.set(button.customId, button);
//             //     Logger.info(`Loaded button: ${button.customId}`);
//             // }
//         });
//     }
// }