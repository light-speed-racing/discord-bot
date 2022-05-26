import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, GuildMember } from 'discord.js';
import { Config } from 'src/config/config.types';
import { DiscordConfig } from 'src/config/discord.config';

@Injectable()
export class RoleService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}
  private readonly guild = this.client.guilds.cache.get(
    this.config.get<DiscordConfig>('discord').guildId,
  );
  private readonly members = this.guild.members.cache;

  usersWhoIs(name: string): Collection<string, GuildMember> {
    return this.members.filter(({ roles }) =>
      roles.cache.some((x) => x.name === name),
    );
  }
}
