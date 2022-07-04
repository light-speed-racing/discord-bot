import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { Message } from 'discord.js';
import { NotBotGuard } from './not-bot.guard';

export class UserSaidGuard implements DiscordGuard {
  private readonly words: string[];

  constructor(...words: string[]) {
    this.words = words;
  }

  @UseGuards(NotBotGuard)
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return this.words.some((word) => message.content.includes(word));
  }
}
