import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RootConfig } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port } = app.get(RootConfig);
  await app.listen(port);
}
bootstrap();
