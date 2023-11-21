import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

type Entrylist = {
  entries: Array<{
    drivers: Array<{
      firstName: string;
      lastName: string;
      shortName: string;
      driverCategory: 0 | 1 | 2 | 3;
      nationality: number;
      playerID: string;
    }>;
    raceNumber: number;
    forcedCarModel: number;
    overrideDriverInfo: 0 | 1;
    defaultGridPosition: number;
    ballastKg: number;
    restrictor: number;
    isServerAdmin: 0 | 1;
  }>;
  forceEntrylist: 0 | 1;
};
const emtryEntrylist: Entrylist = {
  entries: [],
  forceEntrylist: 0,
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly httpService: HttpService) {}

  async entrylist(url?: string): Promise<Entrylist> {
    if (!url) {
      this.logger.log('No url provided. Returning default empty entrylist');
      return { ...emtryEntrylist };
    }

    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Could not fetch entrylist for ${url}`, error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    if (!data) {
      return { ...emtryEntrylist };
    }
    return data;
  }
}
