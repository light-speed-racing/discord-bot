import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Client, TextChannel } from 'discord.js';
import { DiscordChannelService } from '../src/common/discord-channel.service';
import { RootConfig } from '../src/config/config';

describe('DiscordChannelService', () => {
  let resolvedIds: string[];
  let sentMessages: unknown[];
  let service: DiscordChannelService;
  let sendResult: { id: string };
  let sendError: Error | undefined;
  let channel: TextChannel;

  beforeEach(() => {
    resolvedIds = [];
    sentMessages = [];
    sendResult = { id: 'message-1' };
    sendError = undefined;

    channel = {
      send: async (message: unknown) => {
        sentMessages.push(message);
        if (sendError) {
          throw sendError;
        }
        return sendResult;
      },
    } as unknown as TextChannel;
    const client = {
      channels: {
        resolve: (id: string) => {
          resolvedIds.push(id);
          return channel;
        },
      },
    } as unknown as Client;
    const config = {
      discord: {
        logging_channel_id: 'logging-channel',
        weather_update_channel_id: 'weather-channel',
      },
    } as RootConfig;

    service = new DiscordChannelService(client, config);
  });

  it('resolves a channel by id', () => {
    const result = service.find('channel-1');

    assert.equal(result, channel);
    assert.deepEqual(resolvedIds, ['channel-1']);
  });

  it('sends log messages to the configured logging channel', async () => {
    const result = await service.log('server started');

    assert.equal(result, sendResult);
    assert.deepEqual(resolvedIds, ['logging-channel']);
    assert.deepEqual(sentMessages, ['server started']);
  });

  it('sends weather updates to the configured weather channel', async () => {
    const payload = { rain: 0.2 };

    const result = await service.weatherUpdate(payload);

    assert.equal(result, sendResult);
    assert.deepEqual(resolvedIds, ['weather-channel']);
    assert.deepEqual(sentMessages, [payload]);
  });

  it('propagates channel send failures', async () => {
    sendError = new Error('Discord unavailable');

    await assert.rejects(service.log('server started'), /Discord unavailable/);
  });
});
