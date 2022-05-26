import { Command } from '@discord-nestjs/core';
import { SetupSubCommand } from './setup.subcommand';

@Command({
  name: 'server',
  description: 'A set of utility commands to setup an acc server',
  include: [SetupSubCommand],
})
export class ServerCommand {}
