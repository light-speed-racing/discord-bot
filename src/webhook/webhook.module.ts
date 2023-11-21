import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { CustomFieldsService } from './open-game-panel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerHomes } from 'src/database/server-homes.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ServerHomes])],
  providers: [EntrylistService, CustomFieldsService],
  controllers: [WebhookController],
})
export class WebhookModule {}
