import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { CustomFieldsService } from './open-game-panel.service';

@Module({
  imports: [HttpModule],
  providers: [EntrylistService, CustomFieldsService],
  controllers: [WebhookController],
})
export class WebhookModule {}
