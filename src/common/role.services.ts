import { Injectable } from '@nestjs/common';
import { GuildMember, Role } from 'discord.js';
import { GuildService } from './guild.services';

@Injectable()
export class RoleService {
  constructor(private readonly guild: GuildService) {}

  has(member: GuildMember, role: string): boolean {
    return member.roles.cache.map((role) => role.name).includes(role);
  }

  findByName(name: string): Role | null {
    return this.guild.guild.roles.cache.find(
      (role) => role.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async create(name: string): Promise<Role> {
    return await this.guild.guild.roles.create({ name, color: '#088bbf' });
  }

  exists(name: string): boolean {
    return !!this.findByName(name);
  }
}
