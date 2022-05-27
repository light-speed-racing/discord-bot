import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  defaultAdminPassword: process.env.DEFAULT_SERVER_ADMIN_PASSWORD,
  ftp: {
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    username: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    configPath: process.env.FTP_CFG_PATH,
  },
};

export type ServerSetupConfig = typeof config;

export default registerAs('server-setup', (): ServerSetupConfig => config);
