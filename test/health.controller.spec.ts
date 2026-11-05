import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RootConfig } from '../src/config/config';
import { HealthController } from '../src/health/health.controller';

describe('HealthController deployment verification', () => {
  let previousReleaseId: string | undefined;
  let previousInstanceId: string | undefined;
  let controller: HealthController;
  let checkedEndpoints: string[];
  let databaseChecks: number;
  let failure: Error | undefined;

  beforeEach(() => {
    previousReleaseId = process.env.DEPLOYMENT_RELEASE_ID;
    previousInstanceId = process.env.DEPLOYMENT_INSTANCE_ID;
    delete process.env.DEPLOYMENT_RELEASE_ID;
    delete process.env.DEPLOYMENT_INSTANCE_ID;
    checkedEndpoints = [];
    databaseChecks = 0;
    failure = undefined;
    const health = {
      async check(indicators: Array<() => Promise<unknown>>) {
        if (failure) throw failure;
        await Promise.all(indicators.map((indicator) => indicator()));
        return { status: 'ok' };
      },
    } as unknown as HealthCheckService;
    const http = {
      async pingCheck(_name: string, url: string) {
        checkedEndpoints.push(url);
      },
    } as unknown as HttpHealthIndicator;
    const database = {
      async pingCheck() {
        databaseChecks++;
      },
    } as unknown as TypeOrmHealthIndicator;
    const config = { env: 'production', port: 3000, openGamePanel: { ip: '192.0.2.10' } } as RootConfig;
    controller = new HealthController(config, health, http, database);
  });

  afterEach(() => {
    if (previousReleaseId === undefined) delete process.env.DEPLOYMENT_RELEASE_ID;
    else process.env.DEPLOYMENT_RELEASE_ID = previousReleaseId;
    if (previousInstanceId === undefined) delete process.env.DEPLOYMENT_INSTANCE_ID;
    else process.env.DEPLOYMENT_INSTANCE_ID = previousInstanceId;
  });

  it('reports the selected release only after dependency health checks pass', async () => {
    process.env.DEPLOYMENT_RELEASE_ID = 'a'.repeat(40);
    process.env.DEPLOYMENT_INSTANCE_ID = `${'a'.repeat(40)}-${'b'.repeat(32)}`;

    const result = await controller.check();

    assert.equal(result.deploymentReleaseId, 'a'.repeat(40));
    assert.equal(result.deploymentInstanceId, `${'a'.repeat(40)}-${'b'.repeat(32)}`);
    assert.equal(result.status, 'ok');
    assert.equal(result.port, 3000);
    assert.equal(result.env, 'production');
    assert.ok(Number.isFinite(Date.parse(result.time)));
    assert.deepEqual(checkedEndpoints, ['https://google.com', 'http://192.0.2.10']);
    assert.equal(databaseChecks, 1);
  });

  it('omits deployment identity from the JSON response for ordinary local starts', async () => {
    const result = JSON.parse(JSON.stringify(await controller.check()));
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'deploymentReleaseId'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'deploymentInstanceId'), false);
  });

  it('propagates unhealthy dependencies instead of reporting successful deployment', async () => {
    process.env.DEPLOYMENT_RELEASE_ID = 'a'.repeat(40);
    failure = new Error('database unavailable');
    await assert.rejects(controller.check(), /database unavailable/);
  });
});
