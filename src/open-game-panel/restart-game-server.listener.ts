import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GameServer } from 'src/database/game-server.entity';
import { GameManager } from './game-manager.service';
import { GameServerService } from './game-server.service';

@Injectable()
export class RestartGameServerListener {
  constructor(private readonly gameManager: GameManager, private readonly gameServer: GameServerService) {}

  @OnEvent('game-server.restart', { async: true })
  async handleRestartGameServerEvent(gameServer: GameServer) {
    await this.gameServer.updateConfigurationJson(gameServer);

    if (gameServer.custom_fields?.live_weather) {
      await this.gameServer.updateEventJsonWithTrackAndWeather(gameServer);
    }

    await this.gameManager.restart(gameServer);
  }
}
