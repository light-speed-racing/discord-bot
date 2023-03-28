import { Command } from '@discord-nestjs/core';
import { CreateDriverSubcommand } from './create-driver.subcommand';

@Command({
  name: 'driver',
  description: 'Handle drivers',
  include: [CreateDriverSubcommand],
})
export class DriverCommand {}
