import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist } from './entrylist.type';

@Injectable()
export class EntrylistService {
  private readonly logger = new Logger(EntrylistService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetch(entrylistUrl: string): Promise<Entrylist> {
    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(entrylistUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Could not fetch entrylist for ${entrylistUrl}`, error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    if (!data) {
      return {
        entries: [],
        forceEntrylist: 0,
      };
    }
    return data;
  }
}
