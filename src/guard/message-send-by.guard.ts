import { CanActivate, ExecutionContext, Logger, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from './message-is-send-by-a-user.guard';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

@UseGuards(MessageIsSendByAUser)
export class MessageSendByUsername implements CanActivate {
  private logger = new Logger(MessageSendByUsername.name);
  private readonly usernames: string[];
  constructor(...usernames: string[]) {
    this.usernames = usernames;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);
    const result = this.usernames.some((username) => username === message.author.username);

    result && this.logger.log(`${this.usernames} send a message `);

    return result;
  }
}
