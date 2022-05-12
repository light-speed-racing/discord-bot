import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { Message, User } from 'discord.js';
import { MessageFromUserGuard } from './message-from-user.guard';

export class MessageAuthorGuard implements DiscordGuard {
  private readonly usernames: User['username'][];

  constructor(...usernames: string[]) {
    this.usernames = usernames;
  }

  @UseGuards(MessageFromUserGuard)
  canActive(event: 'messageCreate', [{ author }]: [Message]): boolean {
    console.log('mesage by:', author.username, this.usernames);

    return this.usernames.some((username) =>
      author.username.includes(username),
    );
  }
}
