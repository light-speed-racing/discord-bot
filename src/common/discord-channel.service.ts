import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Channel, Client } from 'discord.js';

@Injectable()
export class DiscordChannelService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  find<T extends Channel = Channel>(id: string): T {
    return this.client.channels.resolve(id) as T;
  }
}
