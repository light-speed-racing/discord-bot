import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, Formatters, MessageEmbed, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config/config.types';
import { DiscordConfig } from '../../config/discord.config';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { GithubService } from '../../common/github.service';
import { BaseConfig } from '../../config/base.config';
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
    const path = `${process.cwd()}/last-deploy.txt`;
    const latestDeployTime = existsSync(path) && readFileSync(path, 'utf-8');

    if (
      !!latestDeployTime &&
      env === 'production' &&
      this.ghService.hasGithubToken()
    ) {
      const numberOfCommits = 10;
      const commits = await this.ghService.commitsSince(
        latestDeployTime,
        numberOfCommits,
      );
      const logChannel = this.client.channels.cache.get(
        channels.logging,
      ) as TextChannel;

      const embes = new MessageEmbed()
        .setTitle(":robot: I'm alive after a very short sleep!")
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

      if (commits.length > 0) {
        embes.setDescription(
          `These are the latest ${Formatters.bold(
            `${numberOfCommits}`,
          )} changes since I woke up the last time at ${Formatters.bold(
            moment(latestDeployTime).format('LLLL'),
          )}`,
        );
        commits.map((c) =>
          embes.addField(
            c.messageHeadline,
            `by: ${c.author?.name} at: ${c.pushedDate}`,
          ),
        );
      }

      logChannel.send({ embeds: [embes] });

      writeFileSync(
        `${process.cwd()}/last-deploy.txt`,
        new Date().toISOString(),
      );
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
