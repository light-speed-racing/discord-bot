import { TextInputValue } from '@discord-nestjs/core';

export class FuelCalculatorDto {
  @TextInputValue('duration')
  duration: string;

  @TextInputValue('lapTime')
  lapTime: string;

  @TextInputValue('fuelUsage')
  fuelUsage: string;

  @TextInputValue('safeLaps')
  safeLaps: string;
}
