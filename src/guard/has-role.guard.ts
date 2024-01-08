import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class HasRole implements CanActivate {
  private readonly roleNames: string[];

  constructor(...roleNames: string[]) {
    this.roleNames = roleNames.map((r) => r.toLowerCase());
  }

  async canActivate(context: DiscordExecutionContext): Promise<boolean> {
    const { member } = context.getArgByIndex<Message>(0);

    if (!member.roles.cache.some((role) => this.roleNames.includes(role.name.toLowerCase()))) {
      await member.send(
        `Missing Role. You need ot have the ${this.roleNames.join(', ')} role which is required to call this command`,
      );

      return false;
    }

    return true;
  }
}
