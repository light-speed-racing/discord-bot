import { Injectable } from '@nestjs/common';
import { On, UseGuards } from '@discord-nestjs/core';
import { GuildMember, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { GuildMemberJoinGuard } from 'src/guards/guild-member-join.guard';

@Injectable()
export class OnUserJoinLeave {
  constructor(private readonly config: ConfigService) {}

  @On('guildMemberRemove')
  @UseGuards(GuildMemberJoinGuard)
  async main({
    user,
    guild: { memberCount },
    client: { channels },
  }: GuildMember) {
    const channel = (await channels.fetch(
      this.config.get('DISCORD_LOGGING_CHANNEL_ID'),
    )) as TextChannel;

    return await channel?.send(
      `${user} left the server. We are now ${memberCount}`,
    );
  }
}
