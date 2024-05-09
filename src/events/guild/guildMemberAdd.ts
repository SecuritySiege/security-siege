import { BaseEvent } from "../../interfaces";
import BaseClient from "../../classes/Client";
import { GuildMember, TextChannel, EmbedBuilder } from "discord.js";
import Utility from "classes/Utility";

// import { WelcomeLeave } from "canvafy";
import Logger from "classes/Logger";
import { colors } from "config/colors";

import { WelcomeChannel } from "models/GuildModel";

export default {
    name: "guildMemberAdd",
    async execute(client: BaseClient<true>, member: GuildMember): Promise<void> {
        const welcomeChannel = await WelcomeChannel.findOne<WelcomeChannel>({
            guildId: member.guild.id,
        });

        if (!welcomeChannel) return;

        // const banner = await new WelcomeLeave()
        //     .setAvatar(member.user.displayAvatarURL({ forceStatic: false }))
        //     .setBackground("image", "https://cdn.discordapp.com/attachments/919076443089149953/1232959871519817748/welcome_banner.png?ex=662b5adc&is=662a095c&hm=560fead1e92857a7adef896d585972a757c712cbd5c543eb827f27bba6e8d30d&")
        //     .setTitle("Welcome :D")
        //     .setDescription(`Welcome ${member.user.username}, go ahead and read the rules!`)
        //     .setBorder("#2a2e35")
        //     .setAvatarBorder("#2a2e35")
        //     .setOverlayOpacity(0.3)
        //     .build();

        const welcomeEmbed = new EmbedBuilder()
            .setColor(colors.CYAN)
            .setTitle("Welcome :D")
            .setDescription(`Welcome ${member.user.username}, go ahead and read the rules!`)
            .setThumbnail(member.user.displayAvatarURL({ forceStatic: false }))
            .setTimestamp();

        const channel = await member.guild.channels.cache.get(welcomeChannel.channelId) as TextChannel;

        if (!channel) return;

        const memberCount = await Utility.getMemberCount(member.guild);

        try {
            await channel.send({
                content: `Welcome ${member.user.toString()}! Your our ${memberCount} member!`,
                embeds: [welcomeEmbed],

                // TODO: Wait for Canvas API to be integrated with Bun

                // files: [
                //     {
                //         attachment: banner,
                //         name: `welcome_${member.user.id}.png`
                //     }
                // ]
            })

            return;
        } catch (error) {
            Logger.error(error as Error);
            return;
        }
    }
} as BaseEvent;