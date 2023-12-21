import { DiscordModuleOption, DiscordOptionsFactory } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';
import { RootConfig } from 'src/config/config';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  constructor(private config: RootConfig) {}

  createDiscordOptions(): DiscordModuleOption | Promise<DiscordModuleOption> {
    return {
      token: this.config.discord.token,
      discordClientOptions: {
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildEmojisAndStickers,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessages,
        ],
      },
      registerCommandOptions: [
        {
          forGuild: this.config.discord.guild_id,
          // removeCommandsBefore: true,
        },
      ],
    };
  }
}
