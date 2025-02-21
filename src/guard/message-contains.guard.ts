import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class MessageContains implements CanActivate {
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words.map((word) => word.toLowerCase());
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0).content.toLowerCase();

    return this.words.some((word) => {
      return message.includes(`${word}`) || message.includes(`${word}`);
    });
  }
}
