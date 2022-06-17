import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { StatusCodes } from 'http-status-codes';

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
  private readonly logger: Logger = new Logger(SimgridService.name);

  async jsonEntryListFor(
    id: Championships,
    forceEntryList: YesOrNo = YesOrNo.Yes,
  ) {
    try {
      return {
        ...(await this.fetch(id, 'json')),
        forceEntryList: forceEntryList === YesOrNo.Yes ? 1 : 0,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch JSON entrylist for ${id}. ${error?.message}`,
      );
    }
  }

  async driversOf(id: string): Promise<Array<CsvEntry>> {
    try {
      const data = await this.fetch(id, 'csv', {
        responseType: 'blob',
      });

      return PapaParse.parse<CsvEntry>(data, { header: true }).data.filter(
        (row) => !!row.username,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch CSV entrylist for ${id}. ${error?.message}`,
      );
    }
  }

  private async fetch<T = any>(
    id: string,
    filetype: 'json' | 'csv',
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    const { data, status, statusText } = await axios.get(
      `https://www.thesimgrid.com/admin/championships/${id}/registrations.${filetype}`,
      options,
    );

    if (status !== StatusCodes.OK) {
      throw new NotFoundException(`${status}: ${statusText}`);
    }

    return data;
  }
}
