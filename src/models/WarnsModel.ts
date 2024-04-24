import { Schema, model } from 'mongoose';

export interface Warning {
    warn_id: number;
    reason: string;
    timestamp: number;
    moderator: {
        id: string;
        username: string;
    };
}

export interface Warn {
    guild_id: string;
    user: {
        id: string;
        username: string;
    };
    warnings: Warning[];
}

const WarnSchema: Schema<Warn> = new Schema<Warn>({
    guild_id: { type: String, required: true },
    user: {
        id: { type: String, required: true },
        username: { type: String, required: true }
    },
    warnings: { type: Array<Warning>(), required: true, default: [] }
});

export const WarnsModel = model<Warn>('Warn', WarnSchema);