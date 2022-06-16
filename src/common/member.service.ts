import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GuildMember } from 'discord.js';
import { Config, DiscordConfig } from 'src/config/config.types';

@Injectable()
export class MemberService {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  async findByUsername(username: string): Promise<GuildMember> {
    const members = await this.client.guilds.cache
      .get(this.config.get<DiscordConfig>('discord').guildId)
      .members.fetch({ force: true });

    return members.find((member) => member.user.username === username);
  }

  async hasNickname(guildMember: GuildMember) {
    return !!(await guildMember.fetch(true)).nickname;
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
