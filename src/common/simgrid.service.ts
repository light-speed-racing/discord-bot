import { Injectable, Logger } from '@nestjs/common';
import { Simgrid, CsvEntry } from '@arelstone/simgrid-utils';

import { YesOrNo } from '../yes-or-no.enum';

@Injectable()
export class SimgridService {
  private readonly logger: Logger = new Logger(SimgridService.name);

  async jsonEntryListFor(
    id: string | number,
    forceEntryList: YesOrNo = YesOrNo.Yes,
    teamEvent: YesOrNo = YesOrNo.No,
  ) {
    try {
      return await Simgrid.entryList.ACC.json(
        `${id}`,
        forceEntryList === YesOrNo.Yes,
        teamEvent === YesOrNo.Yes,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch JSON entrylist for ${id}. ${error?.message}`,
      );
    }
  }

  async driversOf(
    id: string | number,
    teamEvent = false,
  ): Promise<ReadonlyArray<CsvEntry>> {
    try {
      return await Simgrid.entryList.ACC.csv(`${id}`, teamEvent);
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch CSV entrylist for ${id}. ${error?.message}`,
      );
    }
  }
}
