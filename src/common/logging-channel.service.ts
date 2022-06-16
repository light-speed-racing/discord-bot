import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TextChannel } from 'discord.js';
import { Config, DiscordConfig } from 'src/config/config.types';

@Injectable()
export class LoggingChannelService {
  private readonly guildId: string;
  private readonly channelId: string;
  private readonly logger: Logger = new Logger(LoggingChannelService.name);

  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {
    const { channels, guildId } = this.config.get<DiscordConfig>('discord');

    this.guildId = guildId;
    this.channelId = channels.logging;
  }

  async send(message: string) {
    const guild = await this.client.guilds.cache;
    const c = (await guild
      .get(this.guildId)
      .channels.cache.find((c) => c.id === this.channelId)) as TextChannel;
    this.logger.debug(message);
    return c.send(message);
  }
}
