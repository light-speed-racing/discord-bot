import { Injectable } from '@nestjs/common';
import { GuildMember, Role } from 'discord.js';
import { GuildService } from './guild.services';

@Injectable()
export class RoleService {
  constructor(private readonly guild: GuildService) {}

  async has(member: GuildMember, role: string): Promise<boolean> {
    const r = await this.findByName(role);

    return member.roles.cache.has(r.id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.guild.guild.roles.cache.find(
      (role) => role.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async create(name: string): Promise<Role> {
    return await this.guild.guild.roles.create({ name, color: '#088bbf' });
  }

  async exists(name: string): Promise<boolean> {
    return !!(await this.findByName(name));
  }
}
