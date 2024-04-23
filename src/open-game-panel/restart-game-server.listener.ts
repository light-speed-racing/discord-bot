import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GameServer } from 'src/database/game-server.entity';
import { GameManager } from './game-manager.service';
import { SimgridService } from 'src/simgrid/simgrid.service';
import { FileManager } from './file-manager.service';
import { WeatherService } from 'src/common/weather.service';
import { EventJSON } from 'src/assetto-corsa-competizione.types';

@Injectable()
export class RestartGameServerListener {
  private logger = new Logger(RestartGameServerListener.name);

  constructor(
    private readonly gameManager: GameManager,
    private readonly simgrid: SimgridService,
    private readonly weather: WeatherService,
    private readonly fileManager: FileManager,
  ) {}

  @OnEvent('game-server.restart', { async: true })
  async handleRestartGameServerEvent(gameServer: GameServer) {
    const { in_game_name } = await this.simgrid.nextRaceOfChampionship(gameServer.custom_fields.simgrid_id);
    const { ambientTemp, cloudLevel, rain, weatherRandomness, track } = (
      await this.weather.forecastFor(in_game_name)
    ).at();

    const content = {
      track: in_game_name ?? track,
      ambientTemp,
      cloudLevel,
      rain,
      weatherRandomness,
    };

    const result = await this.fileManager.update<EventJSON>('event.json', content, gameServer);
    if (!!result) {
      this.logger.log(`event.json updated for ${gameServer.home_path}!`);
    }

    await this.gameManager.restart(gameServer);
  }
}
