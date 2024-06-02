import { Module } from '@nestjs/common';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { CommonModule } from 'src/common/common.module';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { DiscordModule } from '@discord-nestjs/core';
import { RestartPracticeServersTask } from './restart-practice-server.task';
import { ServerTaskManager } from './server-task.manager';

@Module({
  imports: [DiscordModule.forFeature(), OpenGamePanelModule, CommonModule, SimgridModule],
  providers: [RestartPracticeServersTask, ServerTaskManager],
  exports: [RestartPracticeServersTask, ServerTaskManager],
})
export class TasksModule {}
