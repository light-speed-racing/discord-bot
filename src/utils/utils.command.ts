import { Command } from '@discord-nestjs/core';
import { TimezoneSubCommand } from './timezone.subcommand';

@Command({
  name: 'utils',
  description: 'Everything about simgrid in one place',
  include: [TimezoneSubCommand],
})
export class UtilsCommand {}
