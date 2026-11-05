import { Module } from '@nestjs/common';
import { GiphyService } from './giphy.service';
import { DiscordChannelService } from './discord-channel.service';
import { DiscordModule } from '@discord-nestjs/core';
import { WeatherService } from 'src/common/weather.service';
import { HttpModule } from '@nestjs/axios';
import { BotReadyEvent } from './bot-ready.event';

@Module({
  imports: [DiscordModule.forFeature(), HttpModule],
  providers: [GiphyService, DiscordChannelService, WeatherService, BotReadyEvent],
  exports: [GiphyService, DiscordChannelService, WeatherService],
})
export class CommonModule {}
