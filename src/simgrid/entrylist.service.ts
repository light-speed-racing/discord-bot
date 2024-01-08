import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist, EntrylistEntry } from 'src/assetto-corsa-competizione.types';
import { GameServer } from 'src/database/game-server.entity';
import { Patreons } from 'src/patreons';

@Injectable()
export class EntrylistService {
  private readonly logger = new Logger(EntrylistService.name);

  constructor(private readonly httpService: HttpService) {}

  static emptyEntrylist: Entrylist = {
    entries: [],
    forceEntryList: 0,
  };

  async fetch(entity: GameServer): Promise<Entrylist> {
    const {
      home_name,
      custom_fields: { entrylist_url },
    } = entity;
    this.logger.debug(`Fetching entrylist for: ${home_name}`);

    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(entrylist_url).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );

    return {
      entries: data.entries.map(this.ensurePatreonRaceNumber),
      forceEntryList: data.forceEntryList,
    };
  }

  private ensurePatreonRaceNumber = (entry: EntrylistEntry): EntrylistEntry => {
    const steamId = this.sanitizePlayerId(entry);

    if (!Patreons.has(steamId)) {
      return entry;
    }

    return {
      ...entry,
      raceNumber: Patreons.get(steamId).raceNumber,
    };
  };

  private sanitizePlayerId = ({ drivers }: EntrylistEntry) => {
    return Number(drivers.at(0).playerID.replace('S', ''));
  };
}
