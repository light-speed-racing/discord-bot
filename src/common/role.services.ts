import { Injectable, Logger } from '@nestjs/common';
import { GuildMember, Role } from 'discord.js';
import { GuildService } from './guild.services';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly guild: GuildService) {}

  async has(member: GuildMember, rolename: string): Promise<boolean> {
    const role = await this.findByName(rolename);
    try {
      return (await member.fetch(true)).roles.cache.has(role?.id);
    } catch (error) {
      this.logger.error('has: Could not fetch role of members', {
        member,
        rolename,
        error,
      });
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      const role = (await this.guild.guild.roles.fetch()).find(
        (role) => role.name.toLowerCase() === name.toLowerCase(),
      );

      return role;
    } catch (error) {
      this.logger.error('findByName: Could not find', { name, error });
    }
  }

  async create(name: string): Promise<Role> {
    try {
      const role = await this.guild.guild.roles.create({
        name,
        color: '#088bbf',
      });

      return role;
    } catch (error) {
      this.logger.error('create: Could create role', { name, error });
    }
  }

  async exists(name: string): Promise<boolean> {
    try {
      return !!(await this.findByName(name));
    } catch (error) {}
  }
}
