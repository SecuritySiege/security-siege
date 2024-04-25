import { model, Schema } from 'mongoose';

export interface WelcomeChannel {
    guildId: string;
    channelId: string;
}

const welcomeChannelSchema = new Schema<WelcomeChannel>({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    }
});

export const WelcomeChannel = model<WelcomeChannel>('WelcomeChannel', welcomeChannelSchema);

export interface MuteRole {
    guildId: string;
    roleId: string;
}

const muteRoleSchema = new Schema<MuteRole>({
    guildId: {
        type: String,
        required: true
    },
    roleId: {
        type: String,
        required: true
    }
});

export const MuteRole = model("MuteRoles", muteRoleSchema);