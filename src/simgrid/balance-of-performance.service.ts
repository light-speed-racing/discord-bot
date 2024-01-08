import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { BopJSON } from 'src/assetto-corsa-competizione.types';
import { RootConfig } from 'src/config/config';

@Injectable()
export class BalanceOfPerformanceService {
  private logger = new Logger(BalanceOfPerformanceService.name);

  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  async fetch() {
    this.logger.debug('Fetching BOP from LFM');
    const url = new URL(this.config.lfm.url);
    url.searchParams.set('k', this.config.lfm.token);

    const { data } = await firstValueFrom(
      this.http.get<BopJSON>(`${url}`).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );
    return data;
  }
}
