import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GuildService } from 'src/common/guild.services';
import { LoggingChannelService } from 'src/common/logging-channel.service';
import { MemberService } from 'src/common/member.service';
import { RoleService } from 'src/common/role.services';
import { SimgridModule } from 'src/simgrid/simgrid.module';
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
