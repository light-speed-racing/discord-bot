import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextChannel } from 'discord.js';
import { Config, DiscordConfig } from '../config/config.types';
import { GuildService } from './guild.services';

@Injectable()
export class LoggingChannelService {
  private readonly channelId: string;
  private readonly logger: Logger = new Logger(LoggingChannelService.name);

  constructor(
    private readonly config: ConfigService<Config>,
    private readonly guildService: GuildService,
  ) {
    const { channels } = this.config.get<DiscordConfig>('discord');

    this.channelId = channels.logging;
  }

  async send(message: string) {
    this.logger.debug(message);

    const channel = this.guildService.guild.channels.cache.find(
      (channel) => channel.id === this.channelId,
    ) as TextChannel;

    return channel.send(message);
  }
}
