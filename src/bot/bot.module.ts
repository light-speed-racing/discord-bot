import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { JokeCommand } from './commands/joke.command';
import { JokeService } from './services/joke.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [JokeService, BotGateway, JokeCommand],
  exports: [JokeService],
})
export class BotModule {}
