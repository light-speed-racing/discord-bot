export type EntrylistEntry = Entrylist['entries'][number];
export type Entrylist = {
  entries: Array<{
    drivers: Array<{
      firstName: string;
      lastName: string;
      shortName: string;
      driverCategory: 0 | 1 | 2 | 3;
      nationality: number;
      playerID: string;
    }>;
    raceNumber: number;
    forcedCarModel: number;
    overrideDriverInfo: 0 | 1;
    defaultGridPosition: number;
    ballastKg: number;
    restrictor: number;
    isServerAdmin: 0 | 1;
  }>;
  forceEntrylist: 0 | 1;
};
