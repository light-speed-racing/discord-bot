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
      return this.guilsService.guild.members.cache.find(
        ({ user }) => user.username.toLowerCase() === username.toLowerCase(),
      );
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember', error);
      return;
    }
  }

  async hasNickname(guildMember: GuildMember) {
    try {
      return !!(await guildMember.fetch(true)).nickname;
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember');
      return;
    }
  }

  async setNickNameFor(
    guildMember: GuildMember,
    nickname: string,
  ): Promise<GuildMember> {
    if (guildMember.nickname === nickname) {
      return guildMember;
    }
    return await guildMember.setNickname(nickname);
  }
}
