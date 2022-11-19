import { Injectable, Logger } from '@nestjs/common';
import { On, UseGuards } from '@discord-nestjs/core';
import { Formatters, GuildMember, TextChannel, User } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { NotBotGuard } from '../../guards/not-bot.guard';
import { Config } from '../../config/config.types';
import { DiscordConfig } from '../../config/discord.config';

@Injectable()
export class OnUserJoinEvent {
  private readonly logger = new Logger(OnUserJoinEvent.name);

  constructor(private readonly config: ConfigService<Config>) {}

  @On('guildMemberAdd')
  @UseGuards(NotBotGuard)
  async main({ user, guild, client }: GuildMember) {
    this.logger.debug(`${user.username ?? user.tag} just joined`);

    return 
    /**
    const {
      channels: { requestARole, introduceYourSelf, welcome },
    } = this.config.get<DiscordConfig>('discord');

    const message = [
      `${Formatters.bold(this.title(user))}`,
      `Hi there ${user} and welcome to **${guild.name}**`,
      '',
      `You are our member number ${Formatters.bold(
        `${guild.memberCount}`,
      )}. We are so thrilled to see you :boom: :fire: :dancer: :beers: :wave:`,
      '',
      `We would love to get to know you. Would you mind to ${Formatters.channelMention(
        introduceYourSelf,
      )}`,
      '',
      `What are you playing? Please let us know in ${Formatters.channelMention(
        requestARole,
      )}`,
      '',
      'Finally. Have fun. See you on grid.',
    ].join('\r\n');

    setTimeout(async () => {
      const c = (await client.channels.fetch(welcome)) as TextChannel;
      await c.send(message);
    }, 30000);
     */
  }

  /**
  private title({ id }: User) {
    const items = [
      `${Formatters.userMention(id)} has just joined`,
      `Our newest racer is ${Formatters.userMention(id)} :race_car:`,
      `Welcome ${Formatters.userMention(id)} :wave:`,
      `Amazing! ${Formatters.userMention(id)} just joined :partying_face:`,
      `Everybody!!! ${Formatters.userMention(id)} is here! :heart_eyes:`,
      `Hi there ${Formatters.userMention(id)} :wave:`,
      `Hold on... Are you really the famous ${Formatters.userMention(id)}?!?`,
      `Im glad you are here ${Formatters.userMention(id)}`,
      `${Formatters.userMention(id)}, can we be friends?`,
      `${Formatters.userMention(id)}?!? Nice to meet you :wave:`,
    ];

    return items[Math.floor(Math.random() * items.length)];
  }
  */
}
