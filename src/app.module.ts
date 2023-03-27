import { DiscordModule } from '@discord-nestjs/core';
import discordModals from 'discord-modals';
import { Client } from 'discord.js';
import { Module } from '@nestjs/common';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { FuelModule } from './fuel/fuel.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { DiscordConfigService } from './discord-config.service';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({
      useClass: DiscordConfigService,
      setupClientFactory: (client: Client) => discordModals(client),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    HelpModule,
    JokeModule,
    FuelModule,
  ],
})
export class AppModule {}
