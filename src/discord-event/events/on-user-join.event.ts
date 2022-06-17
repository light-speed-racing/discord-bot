import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, On, UseGuards } from '@discord-nestjs/core';
import {
  Client,
  Formatters,
  GuildMember,
  MessageEmbed,
  TextChannel,
  User,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { NotBotGuard } from 'src/guards/not-bot.guard';
import { Config } from 'src/config/config.types';
import { DiscordConfig } from 'src/config/discord.config';
import { BaseConfig } from 'src/config/base.config';

@Injectable()
export class OnUserJoinEvent {
  private readonly logger = new Logger(OnUserJoinEvent.name);

  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  @On('guildMemberAdd')
  @UseGuards(NotBotGuard)
  async main({ user, guild, client }: GuildMember) {
    this.logger.debug(`${user.username ?? user.tag} just joined`);

    const {
      channels: {
        acc_events,
        iracing_events,
        requestARole,
        general,
        rules,
        introduceYourSelf,
        welcome,
      },
    } = this.config.get<DiscordConfig>('discord');
    const { logo } = this.config.get<BaseConfig>('base');

    const embed = new MessageEmbed()
      .setTitle(this.title(user))
      .setDescription(
        [
          `Hi there ${user} and welcome to **${guild.name}**`,
          `You are our member number ${guild.memberCount}. We are so thrilled that you joined :boom: :fire: :dancer: :beers: :wave:`,
          '',
          `You can also Have a look in ${Formatters.channelMention(
            requestARole,
          )} to request a role an event role.`,
          '',
          `Don't hesitate to take part in the chat in ${Formatters.channelMention(
            general,
          )}. Finally. Have fun. See you on grid.`,
        ].join('\n'),
      )
      .addField('Please read our rules', Formatters.channelMention(rules), true)
      .addField(
        'We would love to get to know you',
        `${Formatters.channelMention(introduceYourSelf)}`,
        true,
      )
      .addField(
        'What events are you here for?',
        `Have a look at ${Formatters.channelMention(
          acc_events,
        )} and ${Formatters.channelMention(iracing_events)}`,
        false,
      )
      .setColor('GREEN')
      .setThumbnail(logo)
      .setTimestamp()
      .setAuthor({
        name: this.client.user.tag,
        iconURL: logo,
      })
      .setFooter({
        text: client.user.tag,
        iconURL: logo,
      });

    const c = (await client.channels.fetch(welcome)) as TextChannel;

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
      `${username}?!? Nice to meet you :wave:`,
    ];

    return items[Math.floor(Math.random() * items.length)];
  }
}
