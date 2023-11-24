import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class MessageContains implements CanActivate {
  private logger = new Logger(MessageContains.name);
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);

    return this.words.some((word) => {
      const w = word.toLowerCase();
      const msg = message.content.toLowerCase();

      const success = msg.includes(w);
      success && this.logger.log(`The word "${w}" was part of message: ${msg}`);
      return success;
    });
  }
}
