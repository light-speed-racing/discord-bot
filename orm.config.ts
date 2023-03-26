import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 15432,
  username: 'postgres',
  password: 'postgres',
  database: 'discord-bot',
  entities: [join(__dirname, 'src/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src/database/migrations/*.{ts,js}')],
});
