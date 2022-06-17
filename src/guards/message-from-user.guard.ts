import { DiscordGuard } from '@discord-nestjs/core';
import { Message } from 'discord.js';

export class MessageIsFromUserGuard implements DiscordGuard {
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return !message.author.bot;
  }
}
