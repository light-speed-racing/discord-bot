import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Track } from 'src/assetto-corsa-competizione.types';

type Championship = {
  id: number;
  name: string;
  start_date: string | Date;
  end_date: null;
  capacity: number;
  total_slots_taken: number;
  races?: Array<Race>;
  teams_enabled: boolean;
  entry_fee_required: boolean;
  entry_fee_cents: number | null;
  accepting_registrations: number;
  image: string;
  host_name: string;
  game_name: string;
  url: string;
  results_url: string;
};

type Race = {
  id: number;
  race_name: string;
  track: string;
  in_game_name: Track;
  starts_at: string;
  results_available: boolean;
  hot_lap: boolean;
  ended: boolean;
};

type TracksResponse = Array<{
  id: number;
  game_id: number;
  name: string;
  in_game_name: Track;
}>;
@Injectable()
export class SimgridService {
  constructor(private readonly http: HttpService) {}

  async tracks(gameId = 1) {
    const { data } = await firstValueFrom(
      this.http.get<TracksResponse>(`v1/games/${gameId}/tracks`).pipe(
        catchError((error: AxiosError) => {
          console.error('Error', error);
          throw error.message;
        }),
      ),
    );

    return data;
  }

  async championship(id: string) {
    const { data } = await firstValueFrom(
      this.http.get<Championship>(`v1/championships/${id}`).pipe(
        catchError((error: AxiosError) => {
          console.error('Error', error);
          throw error.message;
        }),
      ),
    );
    const tracks = await this.tracks();
    return {
      ...data,
      races: data?.races?.map((item) => ({
        ...item,
        in_game_name: tracks.find((track) => track.name === item.track)?.in_game_name,
      })),
    };
  }

  async nextRaceOfChampionship(id: string) {
    const { races } = await this.championship(id);

    return races
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .find((race) => !race.ended);
  }
}
