import { Injectable, Logger } from '@nestjs/common';
import { Simgrid, CsvEntry } from '@arelstone/simgrid-utils';
import { Championships } from 'src/championships';
import { YesOrNo } from 'src/server/yes-or-no.enum';

@Injectable()
export class SimgridService {
  private readonly logger: Logger = new Logger(SimgridService.name);

  async jsonEntryListFor(
    id: Championships,
    forceEntryList: YesOrNo = YesOrNo.Yes,
  ) {
    try {
      return await Simgrid.entryList.ACC.json(
        id,
        forceEntryList === YesOrNo.Yes,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch JSON entrylist for ${id}. ${error?.message}`,
      );
    }
  }

  async driversOf(id: string): Promise<ReadonlyArray<CsvEntry>> {
    try {
      return await Simgrid.entryList.ACC.csv(id);
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch CSV entrylist for ${id}. ${error?.message}`,
      );
    }
  }
}
