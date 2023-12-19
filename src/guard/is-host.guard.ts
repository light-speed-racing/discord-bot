import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class IsHost implements CanActivate {
  canActivate(context: DiscordExecutionContext): boolean {
    const { member } = context.getArgByIndex<Message>(0);
    return member.roles.cache.some((r) => r.name === 'Host');
  }
}
