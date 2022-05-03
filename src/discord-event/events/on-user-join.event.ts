import { Injectable, Logger } from '@nestjs/common';
import { InjectDiscordClient, On, UseGuards } from '@discord-nestjs/core';
import {
  Client,
  GuildMember,
  MessageEmbed,
  TextChannel,
  User,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { GuildMemberJoinGuard } from 'src/guards/guild-member-join.guard';
import { MentionUtils } from 'src/common/mention-utils';
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
  @UseGuards(GuildMemberJoinGuard)
  async main({ user, guild, client }: GuildMember) {
    const { channels } = this.config.get<DiscordConfig>('discord');
    const { logo } = this.config.get<BaseConfig>('base');

    this.logger.debug(`${user.tag} just joined`);

    const embed = new MessageEmbed()
      .setTitle(this.title(user))
      .setDescription(
        [
          `Hi there ${user} and welcome to **${guild.name}**`,
          `You are our member number ${guild.memberCount}. We are so thrilled that you joined :boom: :fire: :dancer: :beers: :wave:`,
          '',
          `For planning all of our events we use the Sim Grid. Check out ${MentionUtils.mention(
            'CHANNEL',
            channels.links,
          )} to get the links you need for our profile and calendar. You can also checkout ${MentionUtils.mention(
            'CHANNEL',
            channels.events,
          )} to request an event role. Finally, don't hesitate to join the chat in ${MentionUtils.mention(
            'CHANNEL',
            channels.general,
          )}.`,
        ].join('\n'),
      )
      .addField(
        'Please read our rules',
        MentionUtils.mention('CHANNEL', channels.rules),
        true,
      )
      .addField(
        'We would love to get to know you',
        `${MentionUtils.mention('CHANNEL', channels.introduceYourSelf)}`,
        true,
      )
      .addField(
        'What events are you here for',
        `Please ${MentionUtils.mention('CHANNEL', channels.events)}`,
        true,
      )
      .addField(
        'Also, what you are playing',
        MentionUtils.mention('CHANNEL', channels.whatAreYouPlaying),
        true,
      )
      .addField(
        'and where you are from',
        MentionUtils.mention('CHANNEL', channels.whereAreYouFrom),
        true,
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
