import { Injectable, NotFoundException } from '@nestjs/common';
import { Championships, YesOrNo } from './server-config.dto';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class ServerService {
  async entryListFor(id: Championships, forceEntryList: YesOrNo) {
    const url = `https://www.thesimgrid.com/admin/championships/${id}/registrations.json`;
    const { data, status, statusText } = await axios.get(url);

    if (status !== StatusCodes.OK) {
      throw new NotFoundException(`[EntryList]: ${statusText}`);
    }

    return {
      ...data,
      forceEntryList: !!forceEntryList ? 1 : 0,
    };
  }
}
