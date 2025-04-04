import { DiscordModule } from '@discord-nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordConfigService } from './discord-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/type-orm-configuration.service';
import { ConfigModule } from './config/config.module';
import { JokeModule } from './joke/joke.module';
import { WebhookModule } from './webhook/webhook.module';
import { UserSaidModule } from './user-said/user-said.module';
import { SimgridModule } from './simgrid/simgrid.module';
import { OpenGamePanelModule } from './open-game-panel/open-game-panel.module';
import { HealthModule } from './health/health.module';
import { ApiTokenMiddleware } from './middlewares/api-token.middleware';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({ useClass: DiscordConfigService }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ScheduleModule.forRoot(),
    JokeModule,
    WebhookModule,
    UserSaidModule,
    SimgridModule,
    OpenGamePanelModule,
    HealthModule,
    CommonModule,
    TasksModule,
    OpenaiModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiTokenMiddleware).forRoutes('webhooks/entrylist');
    consumer.apply(ApiTokenMiddleware).forRoutes('webhooks/bop');
  }
}
