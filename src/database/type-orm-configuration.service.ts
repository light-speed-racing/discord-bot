import { Injectable } from '@nestjs/common';
import type { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RootConfig } from 'src/config/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: RootConfig) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.config.database.host,
      port: this.config.database.port,
      database: this.config.database.databaseName,
      username: this.config.database.username,
      password: this.config.database.password,
      entities: ['dist/src/**/*.entity.js'],
      // migrations: ['dist/src/database/migrations/*.js'],
      autoLoadEntities: true,
      // migrationsRun: this.config.env === 'development',
      // migrationsTransactionMode: 'each',
      // schema: 'public',
      // synchronize: false,
      logging: true,
    };
  }
}
