import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { HttpService } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { RootConfig } from '../src/config/config';
import { WeatherService } from '../src/common/weather.service';

type HttpGet = (url: string) => Observable<unknown>;

const forecastItem = (overrides: Record<string, unknown> = {}) => ({
  dt: 0,
  main: {
    temp: 18,
    feels_like: 18.6,
    temp_min: 17,
    temp_max: 19,
    pressure: 1010,
    sea_level: 1010,
    grnd_level: 1000,
    humidity: 80,
    temp_kf: 0,
  },
  weather: [],
  clouds: { all: 55 },
  wind: { speed: 2, deg: 180, gust: 3 },
  visibility: 10000,
  pop: 0.5,
  rain: { '3h': 7.5 },
  sys: { pod: 'd' },
  dt_txt: '2026-11-05 15:00:00',
  ...overrides,
});

describe('WeatherService', () => {
  let requestedUrl: string;
  let get: HttpGet;
  let service: WeatherService;

  beforeEach(() => {
    requestedUrl = '';
    get = (url: string) => {
      requestedUrl = url;
      return of({
        data: {
          list: [
            forecastItem({
              dt_txt: '2026-11-05 12:00:00',
              main: { ...forecastItem().main, feels_like: 40 },
              clouds: { all: 5 },
              rain: { '3h': 0.1 },
            }),
            forecastItem(),
          ],
        },
      });
    };
    const http = { get: (url: string) => get(url) } as unknown as HttpService;
    const config = { openWeatherApi: { token: 'weather-token' } } as RootConfig;
    service = new WeatherService(http, config);
  });

  it('requests the track coordinates and maps the 15:00 forecast', async () => {
    const result = await service.forecastFor('spa');
    const url = new URL(requestedUrl);

    assert.equal(url.origin + url.pathname, 'https://api.openweathermap.org/data/2.5/forecast');
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      appid: 'weather-token',
      mode: 'json',
      lang: 'en',
      units: 'metric',
      cnt: '8',
      lat: '50.4372',
      lon: '5.9714',
    });
    assert.deepEqual(result, {
      track: 'spa',
      cloudLevel: 0.55,
      ambientTemp: 19,
      rain: 0.75,
      weatherRandomness: 1,
    });
  });

  it('applies the minimum ambient temperature and dry-weather defaults', async () => {
    get = () =>
      of({
        data: {
          list: [forecastItem({ main: { ...forecastItem().main, feels_like: 8.2 }, rain: undefined })],
        },
      });

    assert.deepEqual(await service.forecastFor('monza'), {
      track: 'monza',
      cloudLevel: 0.55,
      ambientTemp: 15,
      rain: 0,
      weatherRandomness: 3,
    });
  });

  it('uses the documented randomness thresholds', () => {
    assert.equal(service.randomness(0.9), 0);
    assert.equal(service.randomness(0.7), 1);
    assert.equal(service.randomness(0.5), 2);
    assert.equal(service.randomness(0.49), 3);
  });

  it('propagates HTTP failures', async () => {
    get = () => throwError(() => ({ message: 'weather unavailable' }));

    try {
      await service.forecastFor('spa');
      assert.fail('Expected forecastFor to reject');
    } catch (error) {
      assert.equal(error, 'weather unavailable');
    }
  });
});
