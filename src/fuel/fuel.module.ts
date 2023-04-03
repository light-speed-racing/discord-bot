import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelCommand } from './fuel.command';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [FuelCommand, FuelService],
  exports: [FuelService],
})
export class FuelModule {}
