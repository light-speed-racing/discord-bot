import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist } from './entrylist.type';

@Injectable()
export class EntrylistService {
  private readonly logger = new Logger(EntrylistService.name);

  constructor(private readonly httpService: HttpService) {}

  static emptyEntrylist: Entrylist = {
    entries: [],
    forceEntrylist: 0,
  };

  async fetch(entrylistUrl: string): Promise<Entrylist> {
    this.logger.debug('-> fetching entrylist', entrylistUrl);

    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(entrylistUrl).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );

    return data;
  }
}
