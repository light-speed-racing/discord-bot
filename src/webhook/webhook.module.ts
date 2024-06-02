import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { DiscordModule } from '@discord-nestjs/core';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { CommonModule } from 'src/common/common.module';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [DiscordModule.forFeature(), SimgridModule, OpenGamePanelModule, CommonModule, TasksModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
