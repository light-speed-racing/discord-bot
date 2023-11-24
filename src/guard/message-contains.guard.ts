import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class MessageContains implements CanActivate {
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);

    return this.words.some((word) => {
      const w = word.toLowerCase();
      const msg = message.content.toLowerCase();

      return msg.includes(w);
    });
  }
}
