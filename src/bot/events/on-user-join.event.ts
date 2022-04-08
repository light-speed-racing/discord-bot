import { Injectable } from '@nestjs/common';
import { On, UseGuards } from '@discord-nestjs/core';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { GuildMemberJoinGuard } from 'src/guards/guild-member-join.guard';
import { Mention } from 'src/common/mention';

type LinkToChannel = 'RULES' | 'WHAT_ARE_YOU_PLAYING' | 'WHERE_ARE_YOU_FROM';

@Injectable()
export class OnUserJoinEvent {
  constructor(private readonly config: ConfigService) {}

  @On('guildMemberAdd')
  @UseGuards(GuildMemberJoinGuard)
  async main({ user, guild: { memberCount }, client }: GuildMember) {
    const embed = new MessageEmbed()
      .setTitle(`Everybody, please welcome ${user.username}`)
      .setDescription(
        [
          `Hi there ${user} and welcome to :lsr: Light Speed Racing.`,
          `You are member number ${memberCount}`,
          `I'm **${client.user.username}**. I'm the LSR personal asistant.`,
          `We are so happy that you joined :boom: :fire: :dancer: :beers:`,
        ].join('\n'),
      )
      .addField('Please read our rules', this.linkToChannel('RULES'))
      .addField(
        'We would love to know what games you are playing',
        this.linkToChannel('WHAT_ARE_YOU_PLAYING'),
      )
      .addField(
        'and where you are from',
        this.linkToChannel('WHERE_ARE_YOU_FROM'),
      )
      .setColor('GREEN')
      .setThumbnail(
        'https://www.thesimgrid.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbUFiIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a6af1f0c52f9631dbedd8e30ef5d32624f4edcc7/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2QzNKbGMybDZaVWtpRFRFNE5IZ3hPRFJlQmpzR1ZEb0pZM0p2Y0VraUVERTROSGd4T0RRck1Dc3dCanNHVkRvTWNYVmhiR2wwZVdrOCIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--904fa9fd716ba1706436a9028124e7803824f39f/Logo%20with%20background.png',
      )
      .setFooter({
        text: client.user.tag,
      });
    const c = (await client.channels.fetch(
      this.config.get('DISCORD_WELCOME_CHANNEL_ID'),
    )) as TextChannel;

    return c.send({
      embeds: [embed],
    });
  }

  private linkToChannel(channel: LinkToChannel) {
    return Mention(
      'CHANNEL',
      this.config.get<string>(`DISCORD_${channel}_CHANNEL_ID`),
    );
  }
}
