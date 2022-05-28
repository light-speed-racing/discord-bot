import { Command } from '@discord-nestjs/core';
import { SyncSubCommand } from './sync.subcommand';

@Command({
  name: 'server',
  description: 'A set of utility commands to setup an acc server',
  include: [SyncSubCommand],
})
export class ServerCommand {}
