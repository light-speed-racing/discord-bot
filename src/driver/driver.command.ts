import { Command } from '@discord-nestjs/core';
import { RegisterDriverSubCommand } from './register-driver.sub-command';
import { UpdateDriverSubCommand } from './update-driver.sub-command';

@Command({
  name: 'driver',
  description: 'Driver stuff?!',
  include: [RegisterDriverSubCommand, UpdateDriverSubCommand],
})
export class DriverCommand {}
