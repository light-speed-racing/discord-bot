import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { FuelCommand } from './fuel.command';
import { FuelService } from './fuel.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [FuelCommand, FuelService],
})
export class FuelModule {}
