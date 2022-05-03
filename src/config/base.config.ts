import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  env: process.env.ENV,
  port: process.env.PORT,
  logo: 'https://www.thesimgrid.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbUFiIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a6af1f0c52f9631dbedd8e30ef5d32624f4edcc7/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2QzNKbGMybDZaVWtpRFRFNE5IZ3hPRFJlQmpzR1ZEb0pZM0p2Y0VraUVERTROSGd4T0RRck1Dc3dCanNHVkRvTWNYVmhiR2wwZVdrOCIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--904fa9fd716ba1706436a9028124e7803824f39f/Logo%20with%20background.png',
};

export type BaseConfig = typeof config;

export default registerAs('base', (): BaseConfig => config);
