import { registerAs } from '@nestjs/config';
import { ApiKeysConfig } from './config.types';

export default registerAs(
  'apiKeys',
  (): ApiKeysConfig => ({
    giphy: process.env.GIPHY_API_KEY,
  }),
);
