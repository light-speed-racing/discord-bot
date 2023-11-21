import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DiscordConfigService } from './discord-config.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { ConfigModule } from './config/config.module';
// import { FuelModule } from './fuel/fuel.module';
import { JokeModule } from './joke/joke.module';
import { GiphyModule } from './giphy/giphy.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({ useClass: DiscordConfigService }),
    // TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    // FuelModule,
    JokeModule,
    GiphyModule,
    WebhookModule,
  ],
  providers: [],
})
export class AppModule {}
