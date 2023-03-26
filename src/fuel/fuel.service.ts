import { Injectable } from '@nestjs/common';
import { Calculate } from './calculate.type';
import { CalculationResult } from './calculation.result.type';

@Injectable()
export class FuelService {
  calculate = ({ raceTime, lapTime, fuelPerLap, safeLaps }: Calculate): CalculationResult => {
    const durationInSec = raceTime * 60;
    const [min, sec] = lapTime.split(/\:/gim).map((x) => Number(x));
    const lapTimeInSec = min * 60 + sec;
    const laps = Math.ceil(durationInSec / lapTimeInSec);
    const fuel = Math.ceil(laps * fuelPerLap);
    const safeFuelLiter = Math.ceil((safeLaps + laps) * fuelPerLap);

    return {
      fuel,
      laps,
      fuelPerLap,
      safeLaps,
      safeFuelLiter,
    };
  };
}
