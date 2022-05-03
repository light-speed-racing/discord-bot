import { registerAs } from '@nestjs/config';
import { SimgridConfig } from './config.types';

export default registerAs(
  'simgrid',
  (): SimgridConfig => ({
    profile: 'https://www.thesimgrid.com/hosts/light-speed-racing',
    calendar: 'https://www.thesimgrid.com/hosts/light-speed-racing/calendar',
  }),
);
