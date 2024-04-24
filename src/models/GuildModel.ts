import { model, Schema } from 'mongoose';

export interface Guild {
    guildID: string;
    roles: {
        muted: string;
    };
}

const GuildSchema: Schema<Guild> = new Schema<Guild>({
    guildID: { type: String, required: true },
    roles: {
        muted: {
            type: String,
            default: ""
        }
    }
})

export const GuildModel = model<Guild>("Guild", GuildSchema)