import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { WeatherService } from 'src/common/weather.service';
import { ConfigurationJSON, EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { GameServer } from 'src/database/game-server.entity';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { SimgridService } from 'src/simgrid/simgrid.service';
import { Repository } from 'typeorm';

type FileCall = { filename: string; data?: Record<string, unknown>; entry: GameServer };

function server(
  overrides: Partial<GameServer> = {},
  customFields: GameServer['custom_fields'] = {
    bop_provider: 'kunos',
    is_enabled: true,
    live_weather: true,
    server_type: 'race',
    simgrid_id: '42',
  },
): GameServer {
  return {
    home_id: 1,
    home_name: 'Race Server',
    home_path: '/servers/race',
    IpPort: { port: 9600 },
    custom_fields: customFields,
    ...overrides,
  } as GameServer;
}

describe('GameServerService', () => {
  let repositoryEntries: GameServer[];
  let homedirResult: GameServer;
  let homedirError: Error | undefined;
  let findByCriteria: unknown;
  let empty: boolean;
  let storedFiles: Partial<Record<'configuration.json' | 'event.json', unknown>>;
  let reads: FileCall[];
  let writes: FileCall[];
  let updates: FileCall[];
  let nextRace: { in_game_name: Track } | null;
  let simgridIds: string[];
  let forecasts: Track[];
  let forecastResult: Record<string, unknown>;
  let service: GameServerService;

  beforeEach(() => {
    repositoryEntries = [];
    homedirResult = server();
    homedirError = undefined;
    findByCriteria = undefined;
    empty = false;
    storedFiles = {};
    reads = [];
    writes = [];
    updates = [];
    nextRace = null;
    simgridIds = [];
    forecasts = [];
    forecastResult = { cloudLevel: 0.5, ambientTemp: 20, rain: 0.1, weatherRandomness: 3 };

    const repository = {
      async findOneByOrFail(criteria: unknown) {
        if (homedirError) {
          throw homedirError;
        }
        assert.deepEqual(criteria, { home_path: '/servers/race' });
        return homedirResult;
      },
      async findBy(criteria: unknown) {
        findByCriteria = criteria;
        return repositoryEntries;
      },
    } as Repository<GameServer>;
    const fileManager = {
      async isEmpty() {
        return empty;
      },
      async read(filename: 'configuration.json' | 'event.json', entry: GameServer) {
        reads.push({ filename, entry });
        return storedFiles[filename];
      },
      async write(filename: string, data: Record<string, unknown>, entry: GameServer) {
        writes.push({ filename, data, entry });
        return { message: 'saved', data };
      },
      async update(filename: string, data: Record<string, unknown>, entry: GameServer) {
        updates.push({ filename, data, entry });
        return { message: 'updated', data };
      },
    } as unknown as FileManager;
    const simgrid = {
      async nextRaceOfChampionship(id: string) {
        simgridIds.push(id);
        return nextRace;
      },
    } as unknown as SimgridService;
    const weather = {
      async forecastFor(track: Track) {
        forecasts.push(track);
        return forecastResult;
      },
    } as unknown as WeatherService;

    service = new GameServerService(repository, simgrid, fileManager, weather);
  });

  describe('homedir', () => {
    it('returns the server found by home path', async () => {
      assert.equal(await service.homedir('/servers/race'), homedirResult);
    });

    it('propagates repository lookup failures', async () => {
      homedirError = new Error('server not found');
      await assert.rejects(service.homedir('/servers/race'), /server not found/);
    });
  });

  describe('serverByType', () => {
    it('returns only enabled matching servers with SimGrid live weather configured', async () => {
      const expected = server();
      repositoryEntries = [
        expected,
        server({ home_id: 2 }, null),
        server({ home_id: 3 }, { ...expected.custom_fields, is_enabled: false }),
        server({ home_id: 4 }, { ...expected.custom_fields, simgrid_id: undefined }),
        server({ home_id: 5 }, { ...expected.custom_fields, live_weather: false }),
        server({ home_id: 6 }, { ...expected.custom_fields, server_type: 'practice' }),
      ];

      assert.deepEqual(await service.serverByType('race'), [expected]);
      assert.ok(findByCriteria);
    });
  });

  describe('updateConfigurationJson', () => {
    it('creates a default configuration when the file is empty', async () => {
      const entity = server();
      empty = true;

      await service.updateConfigurationJson(entity);

      assert.deepEqual(writes, [
        {
          filename: 'configuration.json',
          data: {
            lanDiscovery: 1,
            maxConnections: 250,
            registerToLobby: 1,
            configVersion: 1,
            tcpPort: 9600,
            udpPort: 9600,
          },
          entry: entity,
        },
      ]);
      assert.deepEqual(reads, []);
      assert.deepEqual(updates, []);
    });

    it('does nothing when both configured ports already match', async () => {
      storedFiles['configuration.json'] = {
        tcpPort: 9600,
        udpPort: 9600,
        lanDiscovery: 1,
        maxConnections: 100,
        registerToLobby: 1,
      } satisfies ConfigurationJSON;

      await service.updateConfigurationJson(server());

      assert.equal(reads.length, 1);
      assert.deepEqual(writes, []);
      assert.deepEqual(updates, []);
    });

    it('updates both ports while preserving the current configuration', async () => {
      const entity = server();
      const current = {
        tcpPort: 9500,
        udpPort: 9500,
        lanDiscovery: 0,
        maxConnections: 100,
        registerToLobby: 0,
      } satisfies ConfigurationJSON;
      storedFiles['configuration.json'] = current;

      await service.updateConfigurationJson(entity);

      assert.deepEqual(updates, [
        {
          filename: 'configuration.json',
          data: { ...current, tcpPort: 9600, udpPort: 9600 },
          entry: entity,
        },
      ]);
    });
  });

  describe('updateEventJson', () => {
    const currentEvent = {
      track: 'monza',
      eventType: 'E_3h',
      sessions: [],
      ambientTemp: 18,
    } satisfies EventJSON;

    it('skips all work when live weather is disabled', async () => {
      const entity = server({}, { ...server().custom_fields, live_weather: false });

      assert.equal(await service.updateEventJson(entity), undefined);
      assert.deepEqual(reads, []);
      assert.deepEqual(simgridIds, []);
      assert.deepEqual(forecasts, []);
      assert.deepEqual(writes, []);
    });

    it('uses the next SimGrid race track and writes the merged forecast', async () => {
      const entity = server();
      storedFiles['event.json'] = currentEvent;
      nextRace = { in_game_name: 'spa' };

      const result = await service.updateEventJson(entity);

      const expected = { ...currentEvent, ...forecastResult, track: 'spa' };
      assert.deepEqual(result, expected);
      assert.deepEqual(simgridIds, ['42']);
      assert.deepEqual(forecasts, ['spa']);
      assert.deepEqual(writes, [{ filename: 'event.json', data: expected, entry: entity }]);
    });

    it('falls back to the current event track when SimGrid has no next race', async () => {
      const entity = server();
      storedFiles['event.json'] = currentEvent;
      nextRace = null;

      const result = await service.updateEventJson(entity);

      const expected = { ...currentEvent, ...forecastResult, track: 'monza' };
      assert.deepEqual(result, expected);
      assert.deepEqual(simgridIds, ['42']);
      assert.deepEqual(forecasts, ['monza']);
      assert.deepEqual(writes, [{ filename: 'event.json', data: expected, entry: entity }]);
    });
  });
});
