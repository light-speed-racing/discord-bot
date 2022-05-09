import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config/config.types';
import { DiscordConfig } from 'src/config/discord.config';
import { readFileSync, writeFileSync } from 'fs';
import { GithubService } from 'src/common/github.service';
import { BaseConfig } from 'src/config/base.config';
import moment from 'moment';

@Injectable()
export class OnReadyEvent {
  private readonly logger = new Logger(OnReadyEvent.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService<Config>,
    private readonly ghService: GithubService,
  ) {}

  @Once('ready')
  async main() {
    const { channels } = this.config.get<DiscordConfig>('discord');
    const { env, logo } = this.config.get<BaseConfig>('base');
    const channelIds = Object.values(channels);

    this.logger.debug(`Bot ${this.client.user.tag} was started!`);
    this.client.user.setActivity('Use /help');

    // const now = new Date().toISOString();
    const now = '2022-05-08T11:37:25.386Z';
    const latestDeployTime = readFileSync(
      `${process.cwd()}/last-deploy.txt`,
      'utf-8',
    );

    if (env === 'production' && this.ghService.hasGithubToken()) {
      const commits = await this.ghService.commitsSince(now);
      const logChannel = this.client.channels.cache.get(
        channels.logging,
      ) as TextChannel;

      const embes = new MessageEmbed()
        .setTitle(":robot: I'm alive!")
        .setDescription(
          `Commits since last time I woke up ${moment(latestDeployTime).format(
            'LLLL',
          )}`,
        )
        .setThumbnail(logo)
        .setTimestamp()
        .setAuthor({
          name: this.client.user.tag,
          iconURL: logo,
        })
        .setFooter({
          text: this.client.user.tag,
          iconURL: logo,
        });

      commits.map((c) =>
        embes.addField(
          c.messageHeadline,
          `by: ${c.author?.name} at: ${c.pushedDate}`,
        ),
      );

      logChannel.send({ embeds: [embes] });
      writeFileSync(`${process.cwd()}/last-deploy.txt`, now);
    }

    Object.keys(process.env)
      .filter((key) => key.startsWith('DISCORD') && key.endsWith('CHANNEL_ID'))
      .forEach(
        (name) =>
          !channelIds.includes(process.env[name]) &&
          this.logger.error(
            `Channel ${name} was not found in discord configuration. Please update the .env file`,
          ),
      );
  }
}
