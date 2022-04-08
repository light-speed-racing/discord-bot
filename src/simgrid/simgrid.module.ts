import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { SimgridCommand } from './simgrid.commands';
import { CalendarSubCommand } from './sub-commands/calendar.sub-commands';
import { ProfileSubCommand } from './sub-commands/profile.sub-commands';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [SimgridCommand, ProfileSubCommand, CalendarSubCommand],
})
export class SimgridModule {}
