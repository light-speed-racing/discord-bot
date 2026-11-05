import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { SimgridService } from '../src/simgrid/simgrid.service';

const tracks = [{ id: 1, game_id: 1, name: 'Spa', in_game_name: 'spa' as const }];

describe('SimgridService', () => {
  let requests: string[];

  beforeEach(() => {
    requests = [];
  });

  function createService(responses: Record<string, unknown>) {
    return new SimgridService({
      get(url: string) {
        requests.push(url);
        assert.ok(Object.prototype.hasOwnProperty.call(responses, url), `Unexpected request: ${url}`);
        return of({ data: responses[url] });
      },
    } as unknown as HttpService);
  }

  describe('tracks', () => {
    for (const [format, body] of [
      ['wrapped', { data: tracks, pagination: null }],
      ['legacy array', tracks],
    ] as const) {
      it(`normalizes ${format} responses`, async () => {
        const service = createService({ 'v1/games/2/tracks': body });

        assert.deepEqual(await service.tracks(2), tracks);
        assert.deepEqual(requests, ['v1/games/2/tracks']);
      });
    }

    it('accepts an empty collection', async () => {
      const service = createService({ 'v1/games/1/tracks': { data: [], pagination: null } });
      assert.deepEqual(await service.tracks(), []);
    });

    it('rejects unexpected response shapes', async () => {
      for (const body of [null, {}, { data: null }, { data: {} }, '<html>Unavailable</html>']) {
        const service = createService({ 'v1/games/1/tracks': body });
        await assert.rejects(service.tracks(), /Unexpected SimGrid tracks response: expected a tracks array/);
      }
    });

    it('propagates HTTP errors as the response message', async () => {
      const error = Object.assign(new Error('request failed'), { message: 'SimGrid unavailable' });
      const service = new SimgridService({ get: () => throwError(() => error) } as unknown as HttpService);
      const originalError = console.error;
      console.error = () => undefined;

      try {
        await assert.rejects(service.tracks(), (reason) => reason === 'SimGrid unavailable');
      } finally {
        console.error = originalError;
      }
    });
  });

  describe('championship', () => {
    for (const [format, body] of [
      ['wrapped', { data: tracks, pagination: null }],
      ['legacy array', tracks],
    ] as const) {
      it(`maps track names with ${format} track responses`, async () => {
        const championship = {
          id: 42,
          races: [
            { id: 1, track: 'Spa' },
            { id: 2, track: 'Unknown track' },
          ],
        };
        const service = createService({
          'v1/championships/42': championship,
          'v1/games/1/tracks': body,
        });

        assert.deepEqual(await service.championship('42'), {
          ...championship,
          races: [
            { id: 1, track: 'Spa', in_game_name: 'spa' },
            { id: 2, track: 'Unknown track', in_game_name: undefined },
          ],
        });
      });
    }

    it('preserves a championship without races', async () => {
      const championship = { id: 42, name: 'No schedule yet' };
      const service = createService({
        'v1/championships/42': championship,
        'v1/games/1/tracks': tracks,
      });

      assert.deepEqual(await service.championship('42'), { ...championship, races: undefined });
    });
  });

  describe('nextRaceOfChampionship', () => {
    it('returns the earliest unfinished race', async () => {
      const service = createService({
        'v1/championships/42': {
          id: 42,
          races: [
            { id: 3, track: 'Spa', starts_at: '2026-03-03T18:00:00Z', ended: false },
            { id: 1, track: 'Spa', starts_at: '2026-03-01T18:00:00Z', ended: true },
            { id: 2, track: 'Spa', starts_at: '2026-03-02T18:00:00Z', ended: false },
          ],
        },
        'v1/games/1/tracks': tracks,
      });

      const race = await service.nextRaceOfChampionship('42');

      assert.equal(race?.id, 2);
      assert.equal(race?.in_game_name, 'spa');
    });

    it('returns null when every race has ended', async () => {
      const service = createService({
        'v1/championships/42': {
          id: 42,
          races: [{ id: 1, track: 'Spa', starts_at: '2026-03-01T18:00:00Z', ended: true }],
        },
        'v1/games/1/tracks': tracks,
      });

      assert.equal(await service.nextRaceOfChampionship('42'), null);
    });

    it('returns null when the championship has no races', async () => {
      const service = createService({
        'v1/championships/42': { id: 42 },
        'v1/games/1/tracks': tracks,
      });

      assert.equal(await service.nextRaceOfChampionship('42'), null);
    });
  });
});
