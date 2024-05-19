import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist, EntrylistEntry } from 'src/assetto-corsa-competizione.types';
import { RootConfig } from 'src/config/config';
import { Patreons } from 'src/patreons';

@Injectable()
export class EntrylistService {
  constructor(private readonly httpService: HttpService, private readonly config: RootConfig) {}

  static emptyEntrylist: Entrylist = {
    entries: [],
    forceEntryList: 0,
  };

  fetch = async (ids: string): Promise<Entrylist> => {
    const response = await Promise.all(ids.split(',').map((id) => this.request(id)));
    const entries = response
      .map(({ entries }) => entries)
      .flat()
      .reduce(this.moveAdminsToBottom, { drivers: [], admins: [] });

    return {
      entries: [...entries.drivers, ...entries.admins],
      forceEntryList: 1,
    };
  };

  // If having multiple admins in the entrylist, move them to the bottom to allow admins who is signed up to join the server
  private moveAdminsToBottom = (acc: { drivers: EntrylistEntry[]; admins: EntrylistEntry[] }, curr: EntrylistEntry) => {
    const [driver] = curr.drivers;
    if (driver.hasOwnProperty('firstName') || driver.hasOwnProperty('lastName')) {
      return {
        ...acc,
        drivers: [...acc.drivers, curr],
      };
    }

    return {
      ...acc,
      admins: [...acc.admins, curr],
    };
  };

  private request = async (id: string, format: 'json' | 'csv' | 'ini' = 'json'): Promise<Entrylist> => {
    const url = `${this.config.simgrid.url}/v1/championships/${id}/entrylist?format=${format}`;
    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(url).pipe(
        catchError((error: AxiosError) => {
          console.log('Error', error);
          throw error.message;
        }),
      ),
    );

    return {
      entries: data.entries.map(this.ensurePatreonRaceNumber),
      forceEntryList: data.forceEntryList,
    };
  };

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
