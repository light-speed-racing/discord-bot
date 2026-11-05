import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { DiscordModuleOption } from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { RootConfig } from '../src/config/config';
import { DiscordConfigService } from '../src/discord-config.service';

describe('DiscordConfigService', () => {
  let service: DiscordConfigService;

  beforeEach(() => {
    service = new DiscordConfigService({
      discord: {
        token: 'discord-token',
        guild_id: 'guild-1',
      },
    } as RootConfig);
  });

  it('creates Discord connection and guild command options', () => {
    const options = service.createDiscordOptions() as DiscordModuleOption;
    const configuredIntents = options.discordClientOptions.intents;
    assert.ok(Array.isArray(configuredIntents));
    const intents = new Set(configuredIntents);

    assert.equal(options.token, 'discord-token');
    assert.deepEqual(options.registerCommandOptions, [{ forGuild: 'guild-1' }]);
    assert.deepEqual(
      intents,
      new Set([
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent,
      ]),
    );
  });
});
