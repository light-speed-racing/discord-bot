import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { RootConfig } from '../src/config/config';
import { TypeOrmConfigService } from '../src/database/type-orm-configuration.service';

describe('TypeOrmConfigService', () => {
  let service: TypeOrmConfigService;

  beforeEach(() => {
    service = new TypeOrmConfigService({
      database: {
        host: 'database.internal',
        port: 3307,
        database_name: 'discord_bot',
        username: 'bot_user',
        password: 'secret',
      },
    } as RootConfig);
  });

  it('creates the MySQL connection options from configuration', () => {
    assert.deepEqual(service.createTypeOrmOptions(), {
      type: 'mysql',
      host: 'database.internal',
      port: 3307,
      database: 'discord_bot',
      username: 'bot_user',
      password: 'secret',
      entities: ['dist/src/**/*.entity.js'],
      autoLoadEntities: true,
      logging: true,
    });
  });
});
