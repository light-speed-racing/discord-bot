import { Injectable, Logger } from '@nestjs/common';
import { On, UseGuards } from '@discord-nestjs/core';
import { GuildMember, MessageEmbed, TextChannel, User } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { GuildMemberJoinGuard } from 'src/guards/guild-member-join.guard';
import { Mention } from 'src/common/mention';

@Injectable()
export class OnUserJoinEvent {
  private readonly logger = new Logger(OnUserJoinEvent.name);

  constructor(private readonly config: ConfigService) {}

  @On('guildMemberAdd')
  @UseGuards(GuildMemberJoinGuard)
  async main({ user, guild, client }: GuildMember) {
    const { channels } = this.config.get('discord');
    const { logo } = this.config.get('base');

    this.logger.debug(`${user.tag} just joined`);

    const embed = new MessageEmbed()
      .setTitle(this.title(user))
      .setDescription(
        [
          `Hi there ${user} and welcome to ${guild.name}`,
          `You are our member number ${guild.memberCount}. I'm **${client.user.username}**. We are so thrilled that you joined :boom: :fire: :dancer: :beers: :wave:`,
          '',
          `For planning all of our events we use the Sim Grid. Check out ${Mention(
            'CHANNEL',
            channels.links,
          )} to get the links you need for our profile and calendar. You can also checkout ${Mention(
            'CHANNEL',
            channels.events,
          )} to request an event role`,
          '',
          `Finally, don't hesitate to join the chat in ${Mention(
            'CHANNEL',
            channels.general,
          )}.`,
          '',
          'Lets have some good and clean battles with lots of fun',
        ].join('\n'),
      )
      .addField('Please read our rules', Mention('CHANNEL', channels.rules))
      .addField(
        `We would love to get to know you. Stop by ${Mention(
          'CHANNEL',
          channels.introduceYourSelf,
        )} so we cna get to know you.`,
        `${Mention('CHANNEL', channels.introduceYourSelf)}`,
      )
      .addField(
        'What events are you here for',
        `Please ${Mention('CHANNEL', channels.events)}`,
      )
      .addField(
        'Also, what you are playing',
        Mention('CHANNEL', channels.whatAreYouPlaying),
      )
      .addField(
        'and where you are from',
        Mention('CHANNEL', channels.whereAreYouFrom),
      )
      .setColor('GREEN')
      .setThumbnail(logo)
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
