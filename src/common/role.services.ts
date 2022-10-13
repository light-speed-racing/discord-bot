import { Injectable, Logger } from '@nestjs/common';
import { GuildMember, Role } from 'discord.js';
import { GuildService } from './guild.service';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  async has(member: GuildMember, rolename: string): Promise<boolean> {
    const role = await this.findByName(rolename);
    try {
      if (!role) {
        return false;
      }
      return (await member.fetch(true)).roles.cache.has(role.id);
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
      return (await (await GuildService.Roles()).fetch()).find(
        (role) => role.name.toLowerCase() === name.toLowerCase(),
      );
    } catch (error) {
      this.logger.error('findByName: Could not find', { name, error });
      return null;
    }
  }

  async create(name: string): Promise<Role> {
    try {
      return (await GuildService.Guild()).roles.create({
        name,
        color: '#088bbf',
      });
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
