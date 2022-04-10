import { Injectable } from '@nestjs/common';
import { On, UseGuards } from '@discord-nestjs/core';
import { GuildMember, MessageEmbed, TextChannel, User } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { GuildMemberJoinGuard } from 'src/guards/guild-member-join.guard';
import { Mention } from 'src/common/mention';

@Injectable()
export class OnUserJoinEvent {
  constructor(private readonly config: ConfigService) {}

  @On('guildMemberAdd')
  @UseGuards(GuildMemberJoinGuard)
  async main({ user, guild: { memberCount }, client }: GuildMember) {
    const { channels } = this.config.get('discord');

    const embed = new MessageEmbed()
      .setTitle(this.title(user))
      .setDescription(
        [
          `Hi there ${user} and welcome to :lsr: Light Speed Racing.`,
          `You are member number ${memberCount}`,
          `I'm **${client.user.username}**. I'm the LSR personal asistant.`,
          `We are so happy that you joined :boom: :fire: :dancer: :beers:`,
        ].join('\n'),
      )
      .addField('Please read our rules', Mention('CHANNEL', channels.rules))
      .addField(
        'We would love to get to know you',
        `Please ${Mention('CHANNEL', channels.introduceYourSelf)}`,
      )
      .addField(
        'Also, what you are playing',
        Mention(
          'CHANNEL',
          this.config.get('discord.channels.whatAreYouPlaying'),
        ),
      )
      .addField(
        'and where you are from',
        Mention('CHANNEL', channels.whereAreYouFrom),
      )
      .setColor('GREEN')
      .setThumbnail(
        'https://www.thesimgrid.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbUFiIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a6af1f0c52f9631dbedd8e30ef5d32624f4edcc7/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2QzNKbGMybDZaVWtpRFRFNE5IZ3hPRFJlQmpzR1ZEb0pZM0p2Y0VraUVERTROSGd4T0RRck1Dc3dCanNHVkRvTWNYVmhiR2wwZVdrOCIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--904fa9fd716ba1706436a9028124e7803824f39f/Logo%20with%20background.png',
      )
      .setFooter({
        text: client.user.tag,
        iconURL:
          'https://www.thesimgrid.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbUFiIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a6af1f0c52f9631dbedd8e30ef5d32624f4edcc7/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2QzNKbGMybDZaVWtpRFRFNE5IZ3hPRFJlQmpzR1ZEb0pZM0p2Y0VraUVERTROSGd4T0RRck1Dc3dCanNHVkRvTWNYVmhiR2wwZVdrOCIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--904fa9fd716ba1706436a9028124e7803824f39f/Logo%20with%20background.png',
      });

    const c = (await client.channels.fetch(channels.welcome)) as TextChannel;

    return c.send({ embeds: [embed] });
  }

  private title({ username }: User) {
    const items = [
      `${username} has just joined`,
      `Our newest racer is ${username} :race_car:`,
      `Welcome ${username} :wave:`,
      `Amazing! ${username} just joined :partying_face:`,
      `Everybody!!! ${username} is here! :heart_eyes:`,
      `Hi there ${username} :wave:`,
      `Hold on... Are you really the famous ${username}?!?`,
      `Im glad you are here ${username}`,
      `${username}, can we be friends?`,
      `${username}?!? Nice to meet you ${username} :wave:`,
    ];

    return items[Math.floor(Math.random() * items.length)];
  }
}
