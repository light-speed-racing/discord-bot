import { Injectable } from '@nestjs/common';
type Calculate = {
  duration: number;
  usage: number;
  lapTime: string;
  safeLaps: number;
  stintCount: number;
};

type CalculationResult = {
  laps: number;
  fuel: number;
  fuelPerLap: number;
  safeFuel: number;
  safeFuelLiter: number;
  safeFuelPercentage: number;
  fuelPrStint: number;
};

@Injectable()
export class FuelService {
  calculate = (data: Calculate): CalculationResult => {
    return {
      fuel: 0,
      laps: 0,
      fuelPerLap: 0,
      safeFuel: 0,
      safeFuelLiter: 0,
      safeFuelPercentage: 0,
      fuelPrStint: 0,
    };
  };
}
