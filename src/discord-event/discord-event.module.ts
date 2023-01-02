import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GithubService } from '../common/github.service';
import { GuildService } from '../common/guild.services';
import { GreetCommand } from './commands/greet.command';
import { OnMessageEvent } from './events/on-message.event';
import { OnReadyEvent } from './events/on-ready.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    OnReadyEvent,
    OnMessageEvent,
    GreetCommand,
    GithubService,
    GuildService,
  ],
})
export class DiscordEventModule {}
