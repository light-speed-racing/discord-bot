import { CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from './message-is-send-by-a-user.guard';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

@UseGuards(MessageIsSendByAUser)
export class MessageSendByUsername implements CanActivate {
  private readonly usernames: string[];
  constructor(...usernames: string[]) {
    this.usernames = usernames;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);

    return this.usernames.some((username) => username === message.author.username);
  }
}
