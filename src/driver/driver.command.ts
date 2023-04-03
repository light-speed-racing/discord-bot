import { Command, UseGroup } from '@discord-nestjs/core';
import { RegisterDriverSubcommand } from './register-driver.sub-command';
import { UpdateDriverSubcommand } from './update-driver.sub-command';

@Command({
  name: 'driver',
  description: 'Driver stuff?!=',
  include: [
    UseGroup({ name: 'driver', description: 'Handle drivers' }),
    RegisterDriverSubcommand,
    UpdateDriverSubcommand,
  ],
})
export class DriverCommand {}
