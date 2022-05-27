import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  defaultAdminPassword: process.env.DEFAULT_SERVER_ADMIN_PASSWORD,
  ftp: {
    host: process.env.FTP_HOST,
    post: process.env.FTP_PORT,
    username: process.env.USERNAME,
    password: process.env.FTP_PASSWORD,
  },
};

export type ServerSetupConfig = typeof config;

export default registerAs('server-setup', (): ServerSetupConfig => config);
