import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { BotGateway } from './bot.gateway';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { SteerlockModule } from './steerlock/steerlock.module';
import { SimgridModule } from './simgrid/simgrid.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('DISCORD_TOKEN'),
        discordClientOptions: {
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
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
  ],
  providers: [BotGateway],
})
export class AppModule {}
