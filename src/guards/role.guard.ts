import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { MessageFromUserGuard } from './message-from-user.guard';
export class RoleGuard implements DiscordGuard {
  private readonly requiredRoles: string[];

  constructor(...requiredRoles: string[]) {
    this.requiredRoles = requiredRoles.map((role) => role.toLowerCase());
  }

  @UseGuards(MessageFromUserGuard)
  canActive(
    event: 'interactionCreate',
    [{ member, guild }]: [CommandInteraction],
  ): boolean | Promise<boolean> {
    return this.guildMember(guild, member as GuildMember).roles.cache.some(
      ({ name }) => this.requiredRoles.includes(name.toLowerCase()),
    );
  }

  private guildMember({ members }: Guild, { user }: GuildMember) {
    return members.cache.find(({ id }) => id === user.id);
  }
}
