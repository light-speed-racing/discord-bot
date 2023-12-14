export type EntrylistEntry = Entrylist['entries'][number];

export type Driver = {
  firstName: string;
  lastName: string;
  shortName: string;
  driverCategory: 0 | 1 | 2 | 3;
  nationality: number;
  playerID: string;
};

export type Entrylist = {
  entries: Array<{
    drivers: Array<Driver>;
    raceNumber: number;
    forcedCarModel: number;
    overrideDriverInfo: 0 | 1;
    defaultGridPosition: number;
    ballastKg: number;
    restrictor: number;
    isServerAdmin: 0 | 1;
  }>;
  forceEntryList: 0 | 1;
};
