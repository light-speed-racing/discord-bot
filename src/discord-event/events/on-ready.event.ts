import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OnReadyEvent {
  private readonly logger = new Logger(OnReadyEvent.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  @Once('ready')
  async main() {
    const { channels } = this.config.get('discord');
    const channelIds = Object.values(channels);

    this.logger.debug(`Bot ${this.client.user.tag} was started!`);
    this.client.user.setActivity('Use /help');

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
