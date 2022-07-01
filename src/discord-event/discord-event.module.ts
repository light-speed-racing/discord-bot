import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GithubService } from 'src/common/github.service';
import { GuildService } from 'src/common/guild.services';
import { GreetCommand } from './commands/greet.command';
import { OnMessageEvent } from './events/on-message.event';
import { OnReadyEvent } from './events/on-ready.event';
import { OnUserJoinEvent } from './events/on-user-join.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    OnReadyEvent,
    OnUserJoinEvent,
    OnMessageEvent,
    GreetCommand,
    GithubService,
    GuildService,
  ],
})
export class DiscordEventModule {}
