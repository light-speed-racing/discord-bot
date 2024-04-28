import { Module } from '@nestjs/common';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { NightlyRestartGameServerTask } from './nightly-restart-game-server.task';

@Module({
  imports: [OpenGamePanelModule],
  providers: [NightlyRestartGameServerTask],
})
export class TasksModule {}
