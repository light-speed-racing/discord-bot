import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Client, Intents } from 'discord.js';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { DiscordEventModule } from './discord-event/discord-event.module';
import baseConfig from './config/base.config';
import discordConfig, { DiscordConfig } from './config/discord.config';
import apiKeys from './config/apiKeys.config';
import { Config } from './config/config.types';
import { FuelModule } from './fuel/fuel.module';
import discordModals from 'discord-modals';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [baseConfig, discordConfig, apiKeys],
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<Config>) => ({
        token: config.get<DiscordConfig>('discord').token,
        discordClientOptions: {
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
          ],
        },
        registerCommandOptions: [
          {
            forGuild: config.get<DiscordConfig>('discord').guildId,
          },
        ],
      }),
      setupClientFactory: (client: Client) => discordModals(client),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    HelpModule,
    JokeModule,
    DiscordEventModule,
    FuelModule,
    TaskModule,
  ],
})
export class AppModule {}
