import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GuildService } from '../common/guild.services';
import { LoggingChannelService } from '../common/logging-channel.service';
import { MemberService } from '../common/member.service';
import { RoleService } from '../common/role.services';
import { SimgridModule } from '../simgrid/simgrid.module';
import { AssignEventRoleForUsers } from './assign-event-role-for-users.cron';

@Module({
  imports: [DiscordModule.forFeature(), SimgridModule],
  providers: [
    AssignEventRoleForUsers,
    RoleService,
    GuildService,
    MemberService,
    LoggingChannelService,
  ],
})
export class TaskModule {}
