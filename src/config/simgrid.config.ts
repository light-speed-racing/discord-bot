import { registerAs } from '@nestjs/config';

export default registerAs('simgrid', () => ({
  profile: 'https://www.thesimgrid.com/hosts/light-speed-racing',
  calendar: 'https://www.thesimgrid.com/hosts/light-speed-racing/calendar',
}));
