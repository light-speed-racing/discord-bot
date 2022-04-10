import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { SteerlockModule } from './steerlock/steerlock.module';
import { SimgridModule } from './simgrid/simgrid.module';
import { BotModule } from './bot/bot.module';
import baseConfig from './config/base.config';
import discordConfig from './config/discord.config';
import simgridConfig from './config/simgrid.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [baseConfig, discordConfig, simgridConfig],
    }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('DISCORD_TOKEN'),
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
            forGuild: config.get<string>('DISCORD_GUILD_ID'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    HelpModule,
    JokeModule,
    SteerlockModule,
    SimgridModule,
    BotModule,
  ],
})
export class AppModule {}
