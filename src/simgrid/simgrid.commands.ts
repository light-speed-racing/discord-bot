import { Command } from '@discord-nestjs/core';
import { CalendarSubCommand } from './sub-commands/calendar.sub-commands';
import { ProfileSubCommand } from './sub-commands/profile.sub-commands';

@Command({
  name: 'simgrid',
  description: 'Everything about simgrid in one place',
  include: [ProfileSubCommand, CalendarSubCommand],
})
export class SimgridCommand {}
