import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { JokeCommand } from './joke.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [JokeCommand],
})
export class JokeModule {}
