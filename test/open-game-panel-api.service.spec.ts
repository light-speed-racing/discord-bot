import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { HttpService } from '@nestjs/axios';
import { Observable, of, throwError } from 'rxjs';
import { RootConfig } from 'src/config/config';
import { OpenGamePanelApi } from 'src/open-game-panel/open-game-panel-api.service';

describe('OpenGamePanelApi', () => {
  let requestedUrl: string | undefined;
  let response: Observable<unknown>;
  let service: OpenGamePanelApi;

  beforeEach(() => {
    requestedUrl = undefined;
    response = of({ data: { status: 200, message: 'ok' } });
    const http = {
      get(url: string) {
        requestedUrl = url;
        return response;
      },
    } as unknown as HttpService;
    const config = {
      openGamePanel: { api_token: 'token with symbols &?', ip: '192.0.2.10' },
    } as RootConfig;
    service = new OpenGamePanelApi(http, config);
  });

  describe('url', () => {
    it('builds an encoded OGP URL with connection and module parameters', () => {
      const url = service.url('litefm/save', {
        port: 9600,
        relative_path: 'cfg/event file.json',
        contents: '{"rain": 0.5}',
      });

      assert.equal(url.origin, 'http://192.0.2.10');
      assert.equal(url.pathname, '/ogp_api.php');
      assert.equal(url.searchParams.get('litefm/save'), '');
      assert.equal(url.searchParams.get('token'), 'token with symbols &?');
      assert.equal(url.searchParams.get('ip'), '192.0.2.10');
      assert.equal(url.searchParams.get('mod_key'), 'default');
      assert.equal(url.searchParams.get('port'), '9600');
      assert.equal(url.searchParams.get('relative_path'), 'cfg/event file.json');
      assert.equal(url.searchParams.get('contents'), '{"rain": 0.5}');
    });
  });

  describe('get', () => {
    it('requests the generated URL and returns the API payload', async () => {
      const result = await service.get('gamemanager/start', { port: 9600 });

      assert.deepEqual(result, { status: 200, message: 'ok' });
      assert.ok(requestedUrl);
      const url = new URL(requestedUrl);
      assert.equal(url.searchParams.get('gamemanager/start'), '');
      assert.equal(url.searchParams.get('port'), '9600');
    });

    it('propagates the HTTP error message', async () => {
      response = throwError(() => ({ message: 'OGP unavailable' }));

      await assert.rejects(service.get('gamemanager/stop', { port: 9600 }), (error) => error === 'OGP unavailable');
    });
  });
});
