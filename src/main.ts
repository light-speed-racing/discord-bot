import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RootConfig } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.listen(new RootConfig().port);
}

bootstrap();
