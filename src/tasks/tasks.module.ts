import { Module } from '@nestjs/common';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { NightlyRestartGameServerTask } from './nightly-restart-game-server.task';
import { TaskScheduleRegistery } from 'src/tasks/task-schedule-registery';
import { CommonModule } from 'src/common/common.module';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [DiscordModule.forFeature(), OpenGamePanelModule, CommonModule, SimgridModule],
  providers: [
    TaskScheduleRegistery,
    NightlyRestartGameServerTask,
    {
      provide: 'SCHEDULES',
      useFactory: (...schedules) => {
        return schedules;
      },
      inject: [NightlyRestartGameServerTask],
    },
  ],
})
export class TasksModule {}
