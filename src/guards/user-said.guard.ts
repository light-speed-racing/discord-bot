import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { Message } from 'discord.js';
import { MessageIsFromUserGuard } from './message-from-user.guard';

export class UserSaidGuard implements DiscordGuard {
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words.map(this.addWhiteSpace);
  }

  @UseGuards(MessageIsFromUserGuard)
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return this.words.some((word) => message.content.includes(word));
  }

  private addWhiteSpace(word: string) {
    return ` ${word} `;
  }
}
