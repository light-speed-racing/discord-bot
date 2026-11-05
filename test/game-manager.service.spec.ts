import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { GameServer } from 'src/database/game-server.entity';
import { FileManagerModule } from 'src/open-game-panel/file-manager-module.type';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { OpenGamePanelApi } from 'src/open-game-panel/open-game-panel-api.service';

describe('GameManager', () => {
  let apiCalls: Array<{ module: keyof FileManagerModule; parameters: { port: number } }>;
  let logs: string[];
  let getResult: { status: number; message: string };
  let getError: Error | undefined;
  let service: GameManager;
  const entry = { IpPort: { port: 9600 }, home_name: 'Race Server' } as GameServer;

  beforeEach(() => {
    apiCalls = [];
    logs = [];
    getResult = { status: 200, message: 'done' };
    getError = undefined;
    const api = {
      async get(module: keyof FileManagerModule, parameters: { port: number }) {
        apiCalls.push({ module, parameters });
        if (getError) {
          throw getError;
        }
        return getResult;
      },
    } as OpenGamePanelApi;
    const discord = {
      log(message: string) {
        logs.push(message);
      },
    } as DiscordChannelService;
    service = new GameManager(api, discord);
  });

  for (const action of ['start', 'stop', 'restart'] as const) {
    it(`${action}s the server and logs the request and response`, async () => {
      const presentParticiple = { start: 'Starting', stop: 'Stopping', restart: 'Restarting' }[action];
      const result = await service[action](entry);

      assert.equal(result, getResult);
      assert.deepEqual(apiCalls, [{ module: `gamemanager/${action}`, parameters: { port: 9600 } }]);
      assert.deepEqual(logs, [`${presentParticiple} server: Race Server`, '[Race Server]: 200 done']);
    });
  }

  it('propagates an API failure without logging a successful response', async () => {
    getError = new Error('OGP unavailable');

    await assert.rejects(service.start(entry), /OGP unavailable/);
    assert.deepEqual(logs, ['Starting server: Race Server']);
  });
});
