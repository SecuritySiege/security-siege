import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { GuildMember, TextChannel, EmbedBuilder, AttachmentBuilder } from "discord.js";
import Utility from "../../classes/Utility";

import Logger from "../../classes/Logger";
import { colors } from "../../config/colors";
import { drawCard, LinearGradient } from "discord-welcome-card";

import { WelcomeChannel } from "../../models/GuildModel";

export default {
    name: "guildMemberAdd",
    async execute(client: BaseClient<true>, member: GuildMember): Promise<void> {
        const welcomeChannel = await WelcomeChannel.findOne<WelcomeChannel>({
            guildId: member.guild.id,
        });

        if (!welcomeChannel) return;

        const channel = await member.guild.channels.cache.get(welcomeChannel.channelId) as TextChannel;

        if (!channel) return;

        const memberCount = await Utility.getMemberCount(member.guild);

        // =====

        const imageBuffer = await drawCard({
            theme: 'circuit',
            text: {
                title: `Welcome, ${member.user.username}!`,
                text: `Your our ${memberCount} member!`,
                subtitle: 'Go ahead and check the rules!',
                color: `#88f`,
            },
            avatar: {
                image: member.user.displayAvatarURL({ extension: 'png' }),
                outlineWidth: 5,
                // @ts-ignore
                outlineColor: new LinearGradient([0, '#33f'], [1, '#f33']),
            },
            // card: {
            //     background: "https://imgur.com/BBRimPg",
            //     blur: 1,
            //     border: true,
            //     rounded: true,
            // }
        });

        // =====

        const welcomeEmbed = new EmbedBuilder()
            .setColor(colors.CYAN)
            .setTitle("Welcome :D")
            .setDescription(`Welcome ${member.user.username}, go ahead and read the rules!`)
            .setThumbnail(member.user.displayAvatarURL({ forceStatic: false }))
            .setTimestamp();

        try {
            await channel.send({
                // content: `Welcome ${member.user.toString()}! Your our ${memberCount} member!`,
                // embeds: [welcomeEmbed],
                files: [{
                    attachment: imageBuffer,
                    name: 'welcome.jpg'
                  }]
            })

            return;
        } catch (error) {
            Logger.error(error as Error);
            return;
        }
    }
} as BaseEvent;