import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { FuelcalculatorCommand } from './fuelcalculator.command';

@Module({
    imports: [DiscordModule.forFeature()],
    providers: [FuelcalculatorCommand]
})
export class FuelcalculatorModule {}
