import { Command } from '@discord-nestjs/core';
import { EntryListSubCommand } from './subcommands/entrylist.subcommand';
import { SyncSubCommand } from './subcommands/sync.subcommand';

@Command({
  name: 'server',
  description: 'A set of utility commands to setup an acc server',
  include: [SyncSubCommand, EntryListSubCommand],
})
export class ServerCommand {}
