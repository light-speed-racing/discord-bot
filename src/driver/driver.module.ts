import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DriverCommand } from './driver.command';
import { RegisterDriverSubcommand } from './register-driver.sub-command';
import { UpdateDriverSubcommand } from './update-driver.sub-command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [DriverCommand, RegisterDriverSubcommand, UpdateDriverSubcommand],
  exports: [],
})
export class DriverModule {}
