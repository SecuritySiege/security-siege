import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { GuildBan } from "discord.js";
import Logger from "../../classes/Logger";

import { TempBan, TempBanModel } from "../../models/TempBanModel";

export default {
    name: "guildBanAdd",
    async execute(client: BaseClient<true>, guildBan: GuildBan): Promise<void> {
        const { guild, user } = guildBan;
        const tempBan = await TempBanModel.findOne<TempBan>({ guildID: guild.id, user: { id: user.id } });

        if (!tempBan) return;

        const duration = tempBan.duration.expires - Date.now();

        if (duration <= 0) {
            await guild.members.unban(user.id);
            await TempBanModel.deleteOne({ guildID: guild.id, user: { id: user.id } });

            Logger.info(`Unbanned ${user.tag} from ${guild.name} due to the expiration of their temporary ban.`);
            return;
        }
    }
} as BaseEvent;