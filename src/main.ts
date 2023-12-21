import 'isomorphic-fetch';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rootConfig } from './config/config.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(rootConfig.port);
}

bootstrap();
