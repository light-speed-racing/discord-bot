import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { HttpService } from '@nestjs/axios';
import { Entrylist, EntrylistEntry } from '../src/assetto-corsa-competizione.types';
import { RootConfig } from '../src/config/config';
import { Patreons } from '../src/patreons';
import { EntrylistService } from '../src/simgrid/entrylist.service';

const fixtureSteamId = 123456789;

function driverEntry(playerID: string, raceNumber: number): EntrylistEntry {
  return {
    drivers: [
      {
        firstName: 'Test',
        lastName: 'Driver',
        shortName: 'TDR',
        driverCategory: 0,
        nationality: 0,
        playerID,
      },
    ],
    raceNumber,
    forcedCarModel: -1,
    overrideDriverInfo: 0,
    defaultGridPosition: -1,
    ballastKg: 0,
    restrictor: 0,
    isServerAdmin: 0,
  };
}

function adminEntry(playerID: string): EntrylistEntry {
  return {
    ...driverEntry(playerID, 0),
    drivers: [{ playerID } as EntrylistEntry['drivers'][number]],
    isServerAdmin: 1,
  };
}

describe('EntrylistService', () => {
  let requestedUrls: string[];
  let responses: Record<string, Entrylist>;
  let service: EntrylistService;

  beforeEach(() => {
    requestedUrls = [];
    responses = {};
    const http = {
      axiosRef: {
        get: async (url: string) => {
          requestedUrls.push(url);
          if (!responses[url]) {
            throw new Error(`No fixture for ${url}`);
          }
          return { data: responses[url] };
        },
      },
    } as unknown as HttpService;
    const config = { simgrid: { url: 'https://simgrid.example/api' } } as RootConfig;
    service = new EntrylistService(http, config);
    Patreons.set(fixtureSteamId, { discordId: 1, raceNumber: 77, steamId: `S${fixtureSteamId}` });
  });

  afterEach(() => {
    Patreons.delete(fixtureSteamId);
  });

  it('exposes an empty disabled entrylist', () => {
    assert.deepEqual(EntrylistService.emptyEntrylist, { entries: [], forceEntryList: 0 });
  });

  it('merges championships, keeps drivers before admins, and overrides Patreon race numbers', async () => {
    const base = 'https://simgrid.example/api/v1/championships';
    const regular = driverEntry('S987654321', 18);
    const patreon = driverEntry(`S${fixtureSteamId}`, 12);
    const admin = adminEntry('S111');
    responses[`${base}/first/entrylist?format=json`] = { entries: [admin, regular], forceEntryList: 0 };
    responses[`${base}/second/entrylist?format=json`] = { entries: [patreon], forceEntryList: 0 };

    const result = await service.fetch('first,second');

    assert.deepEqual(requestedUrls, [`${base}/first/entrylist?format=json`, `${base}/second/entrylist?format=json`]);
    assert.deepEqual(result.entries, [regular, { ...patreon, raceNumber: 77 }, admin]);
    assert.equal(result.forceEntryList, 1);
  });

  it('preserves the original entry for a non-Patreon driver', async () => {
    const url = 'https://simgrid.example/api/v1/championships/42/entrylist?format=json';
    const entry = driverEntry('S987654321', 18);
    responses[url] = { entries: [entry], forceEntryList: 0 };

    const result = await service.fetch('42');

    assert.strictEqual(result.entries[0], entry);
  });

  it('propagates entrylist request failures', async () => {
    await assert.rejects(service.fetch('missing'), /No fixture for .*\/missing\/entrylist\?format=json/);
  });
});
