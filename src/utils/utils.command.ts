import { Command } from '@discord-nestjs/core';
import { TimezoneSubCommand } from './timezone.subcommand';

@Command({
  name: 'utils',
  description: 'A set of utility commands to help you',
  include: [TimezoneSubCommand],
})
export class UtilsCommand {}
