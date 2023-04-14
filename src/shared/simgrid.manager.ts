import { Logger } from '@nestjs/common';
import axios from 'axios';
import { Hotlap } from 'src/hotlap/hotlap.entity';

export type SimgridDriver = {
  firstName: string;
  lastName: string;
  shortName: string;
  driverCategory: number;
  nationality: number;
  playerID: string;
};

export type SimgridEntryList = {
  entries: ReadonlyArray<{
    drivers: ReadonlyArray<SimgridDriver>;
    raceNumber: number;
    forcedCarModel: number;
    overrideDriverInfo: number;
    defaultGridPosition: number;
    customCar: string;
    ballastKg: number;
    restrictor: number;
    isServerAdmin: 1 | 0;
  }>;
  forceEntryList: 1 | 0;
};

export class SimgridManager {
  private readonly logger = new Logger(SimgridManager.name);

  constructor(private readonly hotlap: Hotlap) {
    this.logger.verbose(`Hotlap: ${hotlap.id}`);
  }

  async entrylist(): Promise<SimgridEntryList> {
    this.logger.verbose(`entrylist->${this.hotlap.id}`);
    const request = await axios.get<SimgridEntryList>(this.hotlap.entrylistUrl);
    return request.data;
  }
}
