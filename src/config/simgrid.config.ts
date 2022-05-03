import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  profile: 'https://www.thesimgrid.com/hosts/light-speed-racing',
  calendar: 'https://www.thesimgrid.com/hosts/light-speed-racing/calendar',
};
export type SimgridConfig = typeof config;

export default registerAs('simgrid', (): SimgridConfig => config);
