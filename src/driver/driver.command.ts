import { Command, UseGroup } from '@discord-nestjs/core';
import { RegisterDriverSubcommand } from './register-driver.sub-command';

@Command({
  name: 'driver',
  description: 'Driver stuff?!=',
  include: [UseGroup({ name: 'driver', description: 'Handle drivers' }), RegisterDriverSubcommand],
})
export class DriverCommand {}
