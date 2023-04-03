import { Field } from '@discord-nestjs/core';
import { TextInputModalData } from 'discord.js';

export class FuelCalculatorDto {
  @Field('duration')
  duration: TextInputModalData;

  @Field('lapTime')
  lapTime: TextInputModalData;

  @Field('fuelUsage')
  fuelUsage: TextInputModalData;

  @Field('safeLaps')
  safeLaps: TextInputModalData;
}
