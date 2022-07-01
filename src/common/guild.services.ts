import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import { Config, DiscordConfig } from 'src/config/config.types';

@Injectable()
export class GuildService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  get guild() {
    return this.client.guilds.cache.get(
      this.config.get<DiscordConfig>('discord').guildId,
    );
  }
}
