import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { LoggingChannelService } from '../common/logging-channel.service';
import { SimgridModule } from '../simgrid/simgrid.module';
import { AssignEventRoleForUsers } from './assign-event-role-for-users.cron';

@Module({
  imports: [DiscordModule.forFeature(), SimgridModule],
  providers: [AssignEventRoleForUsers, LoggingChannelService],
})
export class TaskModule {}
