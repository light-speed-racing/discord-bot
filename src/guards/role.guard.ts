import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { MessageFromUserGuard } from './message-from-user.guard';

export class RoleGuard implements DiscordGuard {
  private readonly requiredRoles: string[];

  constructor(...requiredRoles: string[]) {
    this.requiredRoles = requiredRoles.map((role) => role.toLowerCase());
  }

  @UseGuards(MessageFromUserGuard)
  canActive(
    _: 'interactionCreate',
    [{ member, guild }]: [CommandInteraction],
  ): boolean | Promise<boolean> {
    return guild.members.cache
      .find((m) => m.id === member.user.id)
      .roles.cache.some((role) => {
        return this.requiredRoles.includes(role.name.toLowerCase());
      });
  }
}
