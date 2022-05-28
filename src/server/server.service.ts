import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Championships } from './enum/championships.enum';
import { YesOrNo } from './enum/yes-or-no.enum';

@Injectable()
export class ServerService {
  private readonly logger: Logger = new Logger(ServerService.name);

  async entryListFor(id: Championships, forceEntryList: YesOrNo = YesOrNo.Yes) {
    this.logger.debug(
      `Fetching entrylist from SimGrid for ${id}, forceEntryList: ${forceEntryList}`,
    );
    const url = `https://www.thesimgrid.com/admin/championships/${id}/registrations.json`;
    const { data, status, statusText } = await axios.get(url);

    if (status !== StatusCodes.OK) {
      throw new NotFoundException(`[EntryList]: ${statusText}`);
    }

    return {
      ...data,
      forceEntryList: forceEntryList === YesOrNo.Yes ? 1 : 0,
    };
  }
}
