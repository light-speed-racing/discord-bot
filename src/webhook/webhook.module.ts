import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { ChannelService } from './channel.service';
import { DiscordModule } from '@discord-nestjs/core';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { GiphyModule } from 'src/giphy/giphy.module';
import { WeatherModule } from 'src/weather/weather.module';

@Module({
  imports: [DiscordModule.forFeature(), SimgridModule, OpenGamePanelModule, GiphyModule, WeatherModule],
  providers: [ChannelService],
  controllers: [WebhookController],
})
export class WebhookModule {}
