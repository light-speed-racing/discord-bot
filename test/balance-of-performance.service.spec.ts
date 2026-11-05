import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import lfmBop from '../src/data/acc-lfm-bop.json';
import { BalanceOfPerformanceService } from '../src/simgrid/balance-of-performance.service';

describe('BalanceOfPerformanceService', () => {
  const service = new BalanceOfPerformanceService();

  it('returns the bundled LFM balance of performance data', async () => {
    assert.deepEqual(await service.fetch('lfm'), lfmBop);
  });

  it('returns an empty balance of performance for Kunos', async () => {
    assert.deepEqual(await service.fetch('kunos'), {});
  });

  it('returns an empty balance of performance when the provider is unspecified', async () => {
    assert.deepEqual(await service.fetch(undefined), {});
  });
});
