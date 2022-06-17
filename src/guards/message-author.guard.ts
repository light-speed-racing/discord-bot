import { DiscordGuard, UseGuards } from '@discord-nestjs/core';
import { Message, User } from 'discord.js';
import { MessageIsFromUserGuard } from './message-from-user.guard';

export class MessageAuthorGuard implements DiscordGuard {
  private readonly usernames: User['username'][];

  constructor(...usernames: string[]) {
    this.usernames = usernames;
  }

  @UseGuards(MessageIsFromUserGuard)
  canActive(
    event: 'messageCreate',
    [
      {
        author: { username },
      },
    ]: [Message],
  ): boolean {
    console.log('mesage by:', username, this.usernames);

    return this.usernames.some((u) => username.includes(u));
  }
}
