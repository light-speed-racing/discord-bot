import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { GameServer } from 'src/database/game-server.entity';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { FileManagerModule } from 'src/open-game-panel/file-manager-module.type';
import { OpenGamePanelApi } from 'src/open-game-panel/open-game-panel-api.service';

type ApiCall = { module: keyof FileManagerModule; parameters: FileManagerModule[keyof FileManagerModule] };

describe('FileManager', () => {
  let calls: ApiCall[];
  let handler: (
    module: keyof FileManagerModule,
    parameters: FileManagerModule[keyof FileManagerModule],
  ) => Promise<unknown>;
  let service: FileManager;
  const entry = { IpPort: { port: 9600 } } as GameServer;

  beforeEach(() => {
    calls = [];
    handler = async () => ({ status: 200, message: '' });
    const api = {
      async get(module: keyof FileManagerModule, parameters: FileManagerModule[keyof FileManagerModule]) {
        calls.push({ module, parameters });
        return handler(module, parameters);
      },
    } as OpenGamePanelApi;
    service = new FileManager(api);
  });

  describe('read', () => {
    it('reads and parses a JSON configuration file', async () => {
      handler = async () => ({ status: 200, message: '{"track":"spa"}' });

      assert.deepEqual(await service.read('event.json', entry), { track: 'spa' });
      assert.deepEqual(calls, [{ module: 'litefm/get', parameters: { port: 9600, relative_path: 'cfg/event.json' } }]);
    });

    it('adds file context when the API or JSON parsing fails', async () => {
      handler = async () => {
        throw new Error('connection refused');
      };
      await assert.rejects(service.read('event.json', entry), /Error reading event\.json, Error: connection refused/);

      handler = async () => ({ status: 200, message: 'not-json' });
      await assert.rejects(service.read('event.json', entry), /Error reading event\.json, SyntaxError/);
    });
  });

  describe('list', () => {
    it('returns directory contents and sends the requested path', async () => {
      const listing = {
        files: { event: { group: 'None', user: 'cyg_server', filename: 'event.json', size: 12 } },
        directorys: {},
        binarys: {},
      };
      handler = async () => ({ status: 200, message: listing });

      assert.deepEqual(await service.list('cfg', entry), listing);
      assert.deepEqual(calls, [{ module: 'litefm/list', parameters: { port: 9600, relative_path: 'cfg' } }]);
    });
  });

  describe('isEmpty', () => {
    it('distinguishes empty and populated files', async () => {
      handler = async () => ({ status: 200, message: '' });
      assert.equal(await service.isEmpty('configuration.json', entry), true);

      handler = async () => ({ status: 200, message: '{}' });
      assert.equal(await service.isEmpty('configuration.json', entry), false);
      assert.deepEqual(calls[0], {
        module: 'litefm/get',
        parameters: { port: 9600, relative_path: 'cfg/configuration.json' },
      });
    });
  });

  describe('write', () => {
    it('serializes formatted JSON and returns the saved data', async () => {
      const data = { track: 'spa', rain: 0.2 };
      handler = async () => ({ status: 200, message: 'saved' });

      assert.deepEqual(await service.write('event.json', data, entry), { message: 'saved', data });
      assert.deepEqual(calls, [
        {
          module: 'litefm/save',
          parameters: {
            port: 9600,
            relative_path: 'cfg/event.json',
            contents: JSON.stringify(data, null, 2),
          },
        },
      ]);
    });

    it('adds file context to save failures', async () => {
      handler = async () => {
        throw new Error('disk full');
      };

      await assert.rejects(service.write('event.json', {}, entry), /Error writing event\.json, Error: disk full/);
    });
  });

  describe('update', () => {
    it('merges changes over the current file before saving', async () => {
      handler = async (module) =>
        module === 'litefm/get'
          ? { status: 200, message: '{"track":"spa","rain":0}' }
          : { status: 200, message: 'updated' };

      assert.deepEqual(await service.update('event.json', { rain: 0.4 }, entry), {
        message: 'updated',
        data: { track: 'spa', rain: 0.4 },
      });
      assert.deepEqual(
        calls.map(({ module }) => module),
        ['litefm/get', 'litefm/save'],
      );
      assert.equal(
        (calls[1].parameters as FileManagerModule['litefm/save']).contents,
        JSON.stringify({ track: 'spa', rain: 0.4 }, null, 2),
      );
    });

    it('adds update context to read failures', async () => {
      handler = async () => {
        throw new Error('unavailable');
      };

      await assert.rejects(
        service.update('event.json', { rain: 0.4 }, entry),
        /Error updating event\.json, Error: Error reading event\.json, Error: unavailable/,
      );
    });
  });
});
