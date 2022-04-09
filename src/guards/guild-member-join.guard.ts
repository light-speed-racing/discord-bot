import { DiscordGuard } from '@discord-nestjs/core';
import { GuildMember } from 'discord.js';

export class GuildMemberJoinGuard implements DiscordGuard {
  canActive(event: 'guildMemberAdd', [member]: [GuildMember]): boolean {
    return !member.user.bot;
  }
}
