import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { HelpCommand } from './help.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [HelpCommand],
})
export class HelpModule {}
