import { Injectable } from '@nestjs/common';
import { GameServer } from 'src/database/game-server.entity';
import { OpenGamePanelApi } from './open-game-panel-api.service';

@Injectable()
export class GameManager {
  constructor(private readonly api: OpenGamePanelApi) {}

  async start({ IpPort: { port } }: GameServer) {
    return await this.api.get('gamemanager/start', { port });
  }

  async stop({ IpPort: { port } }: GameServer) {
    return await this.api.get('gamemanager/stop', { port });
  }

  async restart({ IpPort: { port } }: GameServer) {
    return await this.api.get('gamemanager/restart', { port });
  }
}
