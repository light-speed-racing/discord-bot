import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { JokeModule } from './joke/joke.module';
import { FuelModule } from './fuel/fuel.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { DiscordConfigService } from './discord-config.service';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({ useClass: DiscordConfigService }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    JokeModule,
    FuelModule,
  ],
})
export class AppModule {}
