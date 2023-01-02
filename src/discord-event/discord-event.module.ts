import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GithubService } from '../common/github.service';
import { GuildService } from '../common/guild.services';
import { GreetCommand } from './commands/greet.command';
import { OnReadyEvent } from './events/on-ready.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [OnReadyEvent, GreetCommand, GithubService, GuildService],
})
export class DiscordEventModule {}
