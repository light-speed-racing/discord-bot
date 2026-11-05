import assert from 'node:assert/strict';
import test from 'node:test';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { SimgridService } from '../src/simgrid/simgrid.service';

const tracks = [{ id: 1, game_id: 1, name: 'Spa', in_game_name: 'spa' }];

function createService(responses: Record<string, unknown>) {
  return new SimgridService({
    get(url: string) {
      assert.ok(Object.prototype.hasOwnProperty.call(responses, url), `Unexpected request: ${url}`);
      return of({ data: responses[url] });
    },
  } as unknown as HttpService);
}

for (const [format, body] of [
  ['wrapped', { data: tracks, pagination: null }],
  ['legacy array', tracks],
]) {
  test(`normalizes ${format} tracks responses`, async () => {
    const service = createService({ 'v1/games/2/tracks': body });
    assert.deepEqual(await service.tracks(2), tracks);
  });

  test(`maps championship track names with ${format} tracks responses`, async () => {
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

test('accepts an empty tracks collection', async () => {
  const service = createService({ 'v1/games/1/tracks': { data: [], pagination: null } });
  assert.deepEqual(await service.tracks(), []);
});

test('rejects unexpected tracks responses with a useful error', async () => {
  for (const body of [null, {}, { data: null }, { data: {} }, '<html>Unavailable</html>']) {
    const service = createService({ 'v1/games/1/tracks': body });
    await assert.rejects(service.tracks(), /Unexpected SimGrid tracks response: expected a tracks array/);
  }
});
