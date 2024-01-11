import { DiscordModule } from '@discord-nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordConfigService } from './discord-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { ConfigModule } from './config/config.module';
import { JokeModule } from './joke/joke.module';
import { GiphyModule } from './giphy/giphy.module';
import { WebhookModule } from './webhook/webhook.module';
import { UserSaidModule } from './user-said/user-said.module';
import { SimgridModule } from './simgrid/simgrid.module';
// import { OpenGamePanelModule } from './open-game-panel/open-game-panel.module';
import { HealthModule } from './health/health.module';
import { ApiTokenMiddleware } from './middlewares/api-token.middleware';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({ useClass: DiscordConfigService }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    JokeModule,
    GiphyModule,
    WebhookModule,
    UserSaidModule,
    SimgridModule,
    // OpenGamePanelModule,
    HealthModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiTokenMiddleware).forRoutes('webhooks/entrylist');
    consumer.apply(ApiTokenMiddleware).forRoutes('webhooks/bop');
  }
}
