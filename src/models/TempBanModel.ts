import { model, Schema } from 'mongoose';

export interface TempBan {
    guildID: string;
    user: {
        id: string;
        username: string;
    }
    moderator: {
        id: string;
        username: string;
    }
    reason: string;
    duration: {
        at: number;
        expires: number;
    };
}

const TempBanSchema: Schema<TempBan> = new Schema<TempBan>({
    guildID: { type: String, required: true },
    user: {
        id: { type: String, required: true },
        username: { type: String, required: true }
    },
    moderator: {
        id: { type: String, required: true },
        username: { type: String, required: true }
    },
    reason: { type: String, required: true },
    duration: {
        at: { type: Number, required: true },
        expires: { type: Number, required: true }
    }
});

export const TempBanModel = model<TempBan>('TempBan', TempBanSchema);