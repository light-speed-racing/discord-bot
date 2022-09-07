import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GuildService } from '../common/guild.services';
import { LoggingChannelService } from '../common/logging-channel.service';
import { MemberService } from '../common/member.service';
import { RoleService } from '../common/role.services';
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
    RoleService,
    GuildService,
    MemberService,
    LoggingChannelService,
  ],
  exports: [SimgridService],
})
export class SimgridModule {}
