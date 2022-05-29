import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Championships } from './championships.enum';
import { YesOrNo } from './yes-or-no.enum';

@Injectable()
export class ServerService {
  async entryListFor(id: Championships, forceEntryList: YesOrNo = YesOrNo.Yes) {
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
