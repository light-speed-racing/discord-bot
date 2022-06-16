import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, GuildMember, Role, Snowflake } from 'discord.js';
import { kill } from 'process';
import { Config, DiscordConfig } from 'src/config/config.types';

@Injectable()
export class RoleService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  has(member: GuildMember, role: string): boolean {
    return member.roles.cache.map((role) => role.name).includes(role);
  }

  findByName(name: string): Role | null {
    const guild = this.client.guilds.cache.get(
      this.config.get<DiscordConfig>('discord').guildId,
    );

    return guild.roles.cache.find((role) => role.name === name);
  }

  async create(name: string): Promise<Role> {
    const guild = this.client.guilds.cache.get(
      this.config.get<DiscordConfig>('discord').guildId,
    );

    return await guild.roles.create({ name, color: '#088bbf' });
  }

  exists(name: string): boolean {
    return !!this.findByName(name);
  }
}
