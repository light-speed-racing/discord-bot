import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EventJSON } from 'src/assetto-corsa-competizione.types';
import { GameServer } from 'src/database/game-server.entity';
import { WeatherService } from 'src/weather/weather.service';

@Injectable()
export class GameServerStartingListener {
  constructor(private readonly fileManager: FileManager, private readonly weather: WeatherService) {}

  @OnEvent('game-server.starting', { async: true, promisify: true })
  async updateWeather(entity: GameServer): Promise<void> {
    const { custom_fields } = entity;
    if (!custom_fields.is_enabled && !custom_fields?.live_weather) {
      return;
    }

    const eventJSON = await this.fileManager.read<EventJSON>('event.json', entity);
    const weather = await this.weather.forecastFor(eventJSON.track);
    const data = {
      ...eventJSON,
      ...weather.at('15:00'),
    };

    await this.fileManager.write<EventJSON>('event.json', data, entity);

    return;
  }
}
