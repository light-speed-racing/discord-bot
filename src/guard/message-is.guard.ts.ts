import 'isomorphic-fetch';

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Message } from 'discord.js';
interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

export class MessageIs implements CanActivate {
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);

    return this.words.some((word) => message.content.includes(word));
  }
}
