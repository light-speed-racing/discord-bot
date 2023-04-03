import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordConfigService } from './discord-config.service';
import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { ConfigModule } from './config/config.module';
import { FuelModule } from './fuel/fuel.module';
import { HotlapModule } from './hotlap/hotlap.module';
import { DriverModule } from './driver/driver.module';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({ useClass: DiscordConfigService }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    FuelModule,
    HotlapModule,
    DriverModule,
  ],
})
export class AppModule {}
