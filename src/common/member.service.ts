import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GuildMember } from 'discord.js';
import { Config } from '../config/config.types';
import { GuildService } from './guild.services';

@Injectable()
export class MemberService {
  private readonly logger: Logger = new Logger(MemberService.name);

  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
    private readonly guilsService: GuildService,
  ) {}

  async findByUsername(username: string): Promise<GuildMember> {
    try {
      const members = await this.guilsService.guild.members.fetch();

      return members.find(
        ({ user }) =>
          user.username.replace(/[\W_]/g, '_') ===
          username.replace(/[\W_]/g, '_'),
      );
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember', error);
      return;
    }
  }
}
