import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { writeFileSync } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { Championships } from './enum/championships.enum';
import { YesOrNo } from './enum/yes-or-no.enum';

@Injectable()
export class ServerService {
  private readonly logger: Logger = new Logger(ServerService.name);

  static readonly serverConfigTempPath = join(
    __dirname,
    '..',
    '..',
    '__server-config__',
  );

  async entryListFor(id: Championships, forceEntryList: YesOrNo = YesOrNo.Yes) {
    this.logger.debug(
      `Fetching entrylist from SimGrid for ${id}, forceEntryList: ${forceEntryList}`,
    );
    const url = `https://www.thesimgrid.com/admin/championships/${id}/registrations.json`;
    const { data, status, statusText } = await axios.get(url);

    if (status !== StatusCodes.OK) {
      throw new NotFoundException(`[EntryList]: ${statusText}`);
    }

    this.storeFile('entrylist.json', {
      ...data,
      forceEntryList: forceEntryList === YesOrNo.Yes ? 1 : 0,
    });
  }

  storeFile(filename: string, content: Record<string, unknown>) {
    this.logger.debug(`Writing ${filename}`);
    return writeFileSync(
      join(ServerService.serverConfigTempPath, filename),
      JSON.stringify(content, null, 2),
    );
  }
}
