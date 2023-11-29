import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist, EntrylistEntry } from 'src/assetto-corsa-competizione.types';
import { Patreons } from 'src/patreons';

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

    const sanitized = data.entries.map(this.ensurePatreonRaceNumber);

    return {
      entries: sanitized,
      forceEntrylist: data.forceEntrylist,
    };
  }

  private ensurePatreonRaceNumber(entry: EntrylistEntry): EntrylistEntry {
    const { playerID } = entry.drivers.at(0);

    const steamId = Number(playerID.replace('S', ''));

    if (!Patreons.has(steamId)) {
      return entry;
    }

    return {
      ...entry,
      raceNumber: Patreons.get(steamId).raceNumber,
    };
  }
}
