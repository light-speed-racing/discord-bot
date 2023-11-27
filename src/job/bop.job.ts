import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { catchError, firstValueFrom } from 'rxjs';
import { RootConfig } from 'src/config/config';
import { Bop } from 'src/simgrid/bop.type';

@Injectable()
export class BopJob {
  private readonly logger = new Logger(BopJob.name);
  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  @Cron('0 06 * * MON')
  async run() {
    this.logger.debug('Downloading bop from LFM');
    const { data } = await firstValueFrom(
      this.http.get<Bop>(this.config.bopUrl).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );
    const path = join(__dirname, '../..', 'bop.json');

    writeFileSync(path, `${data}`, { encoding: 'utf16le' });
    this.logger.debug(`bop.json was saved to ${path}`);

    return;
  }
}
