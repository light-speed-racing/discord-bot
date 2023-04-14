type Penalty = {
  carId: number;
  driverIndex: number;
  reason: string;
  penalty: string;
  penaltyValue: number;
  violationInLap: number;
  clearedInLap: number;
};

type Driver = {
  firstName: string;
  lastName: string;
  shortName: string;
  playerId: string;
};

type Timing = {
  lastLap: number;
  lastSplits: [number, number, number];
  bestLap: number;
  bestSplits: [number, number, number];
  totalTime: number;
  lapCount: number;
  lastSplitId: number;
};

export type LapJsonEntityCar = {
  carId: number;
  raceNumber: number;
  carModel: number;
  cupCategory: number;
  carGroup: string;
  teamName: string;
  nationality: number;
  carGuid: number;
  teamGuid: number;
  drivers: Array<Driver>;
  currentDriver: Array<Driver>;
  currentDriverIndex: number;
  timing: Timing;
  missingMandatoryPitstop: number;
  driverTotalTimes: Array<number>;
};

export type LapJsonEntityLap = {
  carId: number;
  driverIndex: number;
  laptime: number;
  isValidForBest: boolean;
  splits: [number, number, number];
};

export class LapJsonEntity {
  car: LapJsonEntityCar;
  laps: Array<LapJsonEntityLap>;
  penalties: Array<Penalty>;
  post_race_penalties: Array<Penalty>;
}
