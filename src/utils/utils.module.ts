import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { TimezoneSubCommand } from './timezone.subcommand';
import { UtilsCommand } from './utils.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [UtilsCommand, TimezoneSubCommand],
})
export class UtilsModule {}
