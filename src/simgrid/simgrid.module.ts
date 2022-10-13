import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { SimgridService } from '../common/simgrid.service';
import { SimgridCommand } from './simgrid.commands';
import { CalendarSubCommand } from './sub-commands/calendar.sub-commands';
import { ProfileSubCommand } from './sub-commands/profile.sub-commands';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    SimgridCommand,
    ProfileSubCommand,
    CalendarSubCommand,
    SimgridService,
  ],
  exports: [SimgridService],
})
export class SimgridModule {}
