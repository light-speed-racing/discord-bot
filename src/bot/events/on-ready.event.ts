import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';

@Injectable()
export class OnReadyEvent {
  private readonly logger = new Logger(OnReadyEvent.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  async main() {
    this.logger.debug(`Bot ${this.client.user.tag} was started!`);
    this.client.user.setActivity('Use /help');
  }
}
