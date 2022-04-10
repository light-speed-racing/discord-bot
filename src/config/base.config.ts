import { registerAs } from '@nestjs/config';

export default registerAs('base', () => ({
  env: process.env.ENV,
  port: process.env.PORT,
}));
