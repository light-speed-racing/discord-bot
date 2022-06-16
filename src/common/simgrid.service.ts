import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { Config } from 'src/config/config.types';
import { Championships } from 'src/championships';
import { YesOrNo } from 'src/server/yes-or-no.enum';
import PapaParse from 'papaparse';

type CsvEntry = {
  username: string;
  'real name': string;
  steam64?: string;
  'car class'?: string;
  'car number'?: string;
  'car name'?: string;
  'registered at'?: string;
};

@Injectable()
export class SimgridService {
  constructor(private readonly config: ConfigService<Config>) {}

  async jsonEntryListFor(
    id: Championships,
    forceEntryList: YesOrNo = YesOrNo.Yes,
  ) {
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

  async driversOf(id: string): Promise<Array<CsvEntry>> {
    const url = `https://www.thesimgrid.com/admin/championships/${id}/registrations.csv`;
    const { data, status, statusText } = await axios.get(url, {
      responseType: 'blob',
    });

    if (status !== StatusCodes.OK) {
      throw new NotFoundException(
        `[EntryList]: Could not fetch csv entry list for ${id}. Failed with: ${statusText}`,
      );
    }
    return PapaParse.parse<CsvEntry>(data, { header: true }).data.filter(
      (row) => !!row.username,
    );
  }
}
