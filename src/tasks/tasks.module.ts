import { Module } from '@nestjs/common';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { NightlyRestartPracticeGameServerTask } from './nightly-restart-practice-game-server.task';
import { TaskScheduleRegistery } from 'src/tasks/task-schedule-registery';
import { CommonModule } from 'src/common/common.module';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { DiscordModule } from '@discord-nestjs/core';
import { AbstractScheduler } from './abstract-scheduler';
import { NightlyStartRaceGameServersTask } from './nightly-start-race-game-servers.task';

const tasks = [NightlyRestartPracticeGameServerTask, NightlyStartRaceGameServersTask];
@Module({
  imports: [DiscordModule.forFeature(), OpenGamePanelModule, CommonModule, SimgridModule],
  providers: [
    TaskScheduleRegistery,
    ...tasks,
    {
      provide: 'SCHEDULES',
      useFactory: (...schedules: AbstractScheduler[]) => schedules,
      inject: tasks,
    },
  ],
  exports: tasks,
})
export class TasksModule {}
