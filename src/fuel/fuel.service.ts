import { Injectable } from '@nestjs/common';

type Calculate = {
  raceTime: number;
  fuelPerLap: number;
  lapTime: string;
  safeLaps: number;
};

type CalculationResult = {
  laps: number;
  fuel: number;
  fuelPerLap: number;
  safeLaps: number;
  safeFuelLiter: number;
};

@Injectable()
export class FuelService {
  calculate = ({
    raceTime,
    lapTime,
    fuelPerLap,
    safeLaps,
  }: Calculate): CalculationResult => {
    const durationInSec = raceTime * 60;
    const [min, sec] = lapTime.split(/\:/gim).map((x) => Number(x));
    const lapTimeInSec = min * 60 + sec;
    const totalLaps = Math.ceil(durationInSec / lapTimeInSec);
    const totalFuel = Math.ceil(totalLaps * fuelPerLap);
    const safeFuelLiter = Math.ceil((safeLaps + totalLaps) * fuelPerLap);

    return {
      fuel: totalFuel,
      laps: totalLaps,
      fuelPerLap,
      safeLaps,
      safeFuelLiter,
    };
  };
}
