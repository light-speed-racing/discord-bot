import { InjectDiscordClient } from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  Channel,
  Client,
  Collection,
  Guild,
  GuildMemberManager,
  RoleManager,
} from 'discord.js';
import { Config, DiscordConfig } from 'src/config/config.types';

export class GuildService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  static async Guild(): Promise<Guild> {
    const that = this.prototype;
    return that.client.guilds.cache
      .get(that.config.get<DiscordConfig>('discord').guildId)
      .fetch();
  }

  static async Roles(): Promise<RoleManager> {
    return (await GuildService.Guild()).roles;
  }

  static async Members(): Promise<GuildMemberManager> {
    return (await GuildService.Guild()).members;
  }

  static async Channels(): Promise<Collection<string, Channel>> {
    return (await GuildService.Guild()).channels.fetch();
  }
}
