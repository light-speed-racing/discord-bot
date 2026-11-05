import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { BotReadyEvent } from '../src/common/bot-ready.event';
import { DiscordChannelService } from '../src/common/discord-channel.service';

describe('BotReadyEvent', () => {
  let previousReleaseId: string | undefined;

  beforeEach(() => {
    previousReleaseId = process.env.DEPLOYMENT_RELEASE_ID;
    delete process.env.DEPLOYMENT_RELEASE_ID;
  });

  afterEach(() => {
    if (previousReleaseId === undefined) delete process.env.DEPLOYMENT_RELEASE_ID;
    else process.env.DEPLOYMENT_RELEASE_ID = previousReleaseId;
  });

  it('announces startup through the configured logging channel', async () => {
    process.env.DEPLOYMENT_RELEASE_ID = 'c61a7d398d851a718146ed67bf79a60c99accf35';
    const messages: string[] = [];
    const channels = {
      log: async (message: string) => messages.push(message),
    } as unknown as DiscordChannelService;

    await new BotReadyEvent(channels).onReady();

    assert.deepEqual(messages, ['bot is online, running c61a7d3']);
  });

  it('uses unknown when no deployment commit is available', async () => {
    const messages: string[] = [];
    const channels = {
      log: async (message: string) => messages.push(message),
    } as unknown as DiscordChannelService;

    await new BotReadyEvent(channels).onReady();

    assert.deepEqual(messages, ['bot is online, running unknown']);
  });

  it('keeps notification failures from stopping the bot', async () => {
    const channels = {
      log: async () => {
        throw new Error('Discord unavailable');
      },
    } as unknown as DiscordChannelService;

    await assert.doesNotReject(new BotReadyEvent(channels).onReady());
  });
});
