import { DiscordModule } from '@discord-nestjs/core';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { SteerlockModule } from './steerlock/steerlock.module';
import { SimgridModule } from './simgrid/simgrid.module';
import { DiscordEventModule } from './discord-event/discord-event.module';
import { UtilsModule } from './utils/utils.module';
import baseConfig from './config/base.config';
import discordConfig, { DiscordConfig } from './config/discord.config';
import simgridConfig from './config/simgrid.config';
import apiKeys from './config/apiKeys.config';
import { Config } from './config/config.types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [baseConfig, discordConfig, simgridConfig, apiKeys],
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<Config>) => {
        const { guildId, token } = config.get<DiscordConfig>('discord');
        return {
          token,
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
              forGuild: guildId,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
    HelpModule,
    JokeModule,
    SteerlockModule,
    SimgridModule,
    DiscordEventModule,
    UtilsModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly config: ConfigService<Config>) {}

  onModuleInit() {
    if (!this.config.get<DiscordConfig>('discord').guildId) {
      throw new Error('Missing guildId in the .env');
    }
  }
}
