import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import inRange from 'lodash.inrange';
import { catchError, firstValueFrom } from 'rxjs';
import { EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { RootConfig } from 'src/config/config';
import { RaceTracks } from 'src/race-tracks';
import round from 'lodash.round';

type ForecaseItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  clouds: { all: number };
  wind: { speed: number; deg: number; gust: number };
  visibility: number;
  pop: number;
  rain?: { '3h': number };
  sys: { pod: string };
  dt_txt: string;
};

type Forecast = {
  cod: string;
  message: number | string;
  cnt: number;
  list: Array<ForecaseItem>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
};

type Time = '03:00' | '06:00' | '09:00' | '12:00' | '15:00' | '18:00' | '21:00' | '24:00';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  protected track: Track;
  protected list: Record<Time, ForecaseItem>;
  protected city: Forecast['city'];

  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  async forecastFor(track: Track) {
    this.track = track;

    const {
      coordinates: [latitude, longitude],
    } = RaceTracks[track];
    this.logger.debug(`Getting weather for ${track} (${longitude},${latitude})`);

    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('appid', this.config.openWeatherApi.token);
    url.searchParams.set('mode', 'json');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('units', 'metric');
    url.searchParams.set('cnt', '8');
    url.searchParams.set('lat', `${latitude}`);
    url.searchParams.set('lon', `${longitude}`);

    const { data } = await firstValueFrom(
      this.http.get<Forecast>(`${url}`).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );

    this.city = data.city;

    this.list = data.list.reduce<Record<Time, ForecaseItem>>(
      (acc, item) => {
        const [hh, mm] = item.dt_txt.split(' ')[1].split(':');

        return {
          ...acc,
          [`${hh}:${mm}`]: item,
        };
      },
      {
        '03:00': null,
        '06:00': null,
        '09:00': null,
        '12:00': null,
        '15:00': null,
        '18:00': null,
        '21:00': null,
        '24:00': null,
      },
    );
    return this;
  }

  at(time: Time) {
    if (!this.list) {
      this.logger.error('No forecast available');
      return {};
    }
    const forecast = this.list[time];
    const rain = this.rain(forecast);

    return {
      track: this.track,
      cloudLevel: this.cloudLevel(forecast),
      ambientTemp: this.ambientTemp(forecast),
      rain,
      weatherRandomness: this.randomness(rain),
    };
  }

  cloudLevel = (item: ForecaseItem) => item?.clouds.all / 100;

  rain = (item: ForecaseItem) => {
    const n = item?.rain?.['3h'] / 10 ?? 0;

    if (!n) {
      return 0;
    }

    return round(n, 2);
  };

  ambientTemp = (item: ForecaseItem) => {
    const temperature = round(item?.main.feels_like);

    return temperature >= 15 ? temperature : 15;
  };

  randomness = (rain: number): EventJSON['weatherRandomness'] => {
    const r = rain * 100;
    if (inRange(r, 90, 100)) {
      return 0;
    }
    if (inRange(r, 70, 90)) {
      return 1;
    }
    if (inRange(r, 50, 70)) {
      return 2;
    }

    return 3;
  };
}
