import { registerAs } from '@nestjs/config';

export default registerAs('apiKeys', () => ({
  giphy: process.env.GIPHY_API_KEY,
}));
