import { Injectable } from '@nestjs/common';
import { GuildMember, Role } from 'discord.js';
import { GuildService } from './guild.services';

@Injectable()
export class RoleService {
  constructor(private readonly guild: GuildService) {}

  async has(member: GuildMember, rolename: string): Promise<boolean> {
    const role = await this.findByName(rolename);

    return (await member.fetch(true)).roles.cache.has(role?.id);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = (await this.guild.guild.roles.fetch()).find(
      (role) => role.name.toLowerCase() === name.toLowerCase(),
    );

    return role;
  }

  async create(name: string): Promise<Role> {
    const role = await this.guild.guild.roles.create({
      name,
      color: '#088bbf',
    });

    return role;
  }

  async exists(name: string): Promise<boolean> {
    return !!(await this.findByName(name));
  }
}
