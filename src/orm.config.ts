import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 15432,
  username: 'postgres',
  password: 'postgres',
  database: 'discord-bot',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
});
