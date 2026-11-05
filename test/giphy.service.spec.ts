import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { GifsResult, GiphyFetch, SearchOptions } from '@giphy/js-fetch-api';
import { RootConfig } from '../src/config/config';
import { GiphyService } from '../src/common/giphy.service';

describe('GiphyService', { concurrency: false }, () => {
  const originalSearch = GiphyFetch.prototype.search;
  let calls: Array<{ query: string; options?: SearchOptions }>;
  let expectedResult: GifsResult;

  beforeEach(() => {
    calls = [];
    expectedResult = { data: [], pagination: {}, meta: {} } as GifsResult;
    GiphyFetch.prototype.search = async function (query: string, options?: SearchOptions) {
      calls.push({ query, options });
      return expectedResult;
    };
  });

  afterEach(() => {
    GiphyFetch.prototype.search = originalSearch;
  });

  it('delegates searches and options to the Giphy client', async () => {
    const service = new GiphyService({ giphy: { apiKey: 'giphy-key' } } as RootConfig);
    const options: SearchOptions = { limit: 3, rating: 'pg' };

    const result = await service.search('sim racing', options);

    assert.equal(result, expectedResult);
    assert.deepEqual(calls, [{ query: 'sim racing', options }]);
  });

  it('propagates Giphy client failures', async () => {
    GiphyFetch.prototype.search = async () => {
      throw new Error('giphy unavailable');
    };
    const service = new GiphyService({ giphy: { apiKey: 'giphy-key' } } as RootConfig);

    await assert.rejects(service.search('crash'), /giphy unavailable/);
  });
});
