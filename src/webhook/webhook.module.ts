import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { CustomFieldsService } from './open-game-panel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerHomes } from 'src/database/server-homes.entity';
import { ChannelService } from './channel.service';
import { DiscordModule } from '@discord-nestjs/core';
import { SimgridModule } from 'src/simgrid/simgrid.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServerHomes]), DiscordModule.forFeature(), SimgridModule],
  providers: [CustomFieldsService, ChannelService],
  controllers: [WebhookController],
})
export class WebhookModule {}
