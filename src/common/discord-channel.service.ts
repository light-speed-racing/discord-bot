import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Channel, Client, TextChannel } from 'discord.js';
import { RootConfig } from 'src/config/config';

@Injectable()
export class DiscordChannelService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: RootConfig,
  ) {}

  find<T extends Channel = TextChannel>(id: string): T {
    return this.client.channels.resolve(id) as T;
  }

  async log(message: string) {
    const channel = this.find<TextChannel>(this.config.discord.logging_channel_id);
    return await channel.send(message);
  }
}
