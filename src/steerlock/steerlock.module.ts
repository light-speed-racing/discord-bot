import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { SteerlockCommand } from './steerlock.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [SteerlockCommand],
})
export class SteerlockModule {}
