import { DiscordModuleOption, DiscordOptionsFactory } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Intents } from 'discord.js';
import { RootConfig } from 'src/config/config';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  constructor(private config: RootConfig) {}

  createDiscordOptions(): DiscordModuleOption | Promise<DiscordModuleOption> {
    return {
      token: this.config.discord.token,
      discordClientOptions: {
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MEMBERS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        ],
      },
      registerCommandOptions: [{ forGuild: this.config.discord.guildId }],
    };
  }
}
