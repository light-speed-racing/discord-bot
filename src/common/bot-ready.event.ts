import { Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { DiscordChannelService } from './discord-channel.service';

@Injectable()
export class BotReadyEvent {
  private readonly logger = new Logger(BotReadyEvent.name);

  constructor(private readonly channels: DiscordChannelService) {}

  @Once('ready')
  async onReady() {
    const commit = process.env.DEPLOYMENT_RELEASE_ID?.slice(0, 7) || 'unknown';
    try {
      await this.channels.log(`bot is online, running ${commit}`);
    } catch {
      this.logger.warn('Could not send the startup notification to the logging channel.');
    }
  }
}
