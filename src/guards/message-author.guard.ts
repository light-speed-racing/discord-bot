import { DiscordGuard } from '@discord-nestjs/core';
import { Message, User } from 'discord.js';

export class MessageAuthorGuard implements DiscordGuard {
  private readonly usernames: User['username'][];

  constructor(...usernames: string[]) {
    this.usernames = usernames;
  }

  canActive(
    event: 'messageCreate',
    [
      {
        author: { username },
      },
    ]: [Message],
  ): boolean {
    console.log('message send by:', username, this.usernames);

    return this.usernames.some((u) => username.includes(u));
  }
}
