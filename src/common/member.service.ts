import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GuildMember } from 'discord.js';
import { Config } from '../config/config.types';
import { GuildService } from './guild.services';

@Injectable()
export class MemberService {
  private readonly logger: Logger = new Logger(MemberService.name);

  constructor(private readonly guilsService: GuildService) {}

  async find(query: string): Promise<GuildMember> {
    try {
      return (
        await this.guilsService.guild.members.search({
          query,
          cache: false,
          limit: 1,
        })
      ).first();
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember', error);
      return;
    }
  }
}
