import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { JokeCommand } from './joke.command';
import { ChuckNorrisJokeCommand } from './chuck-norris.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [JokeCommand, ChuckNorrisJokeCommand],
})
export class JokeModule {}
