import { Injectable } from '@nestjs/common';
import { GameServer } from 'src/database/game-server.entity';
import { OpenGamePanelApi } from './open-game-panel-api.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';

@Injectable()
export class GameManager {
  constructor(private readonly api: OpenGamePanelApi, private readonly discord: DiscordChannelService) {}

  async start({ IpPort: { port }, home_name }: GameServer) {
    this.discord.log(`Starting server: ${home_name}`);
    const response = await this.api.get('gamemanager/start', { port });

    this.discord.log(`[${home_name}]: ${response.status} ${response.message}`);

    return response;
  }

  async stop({ IpPort: { port }, home_name }: GameServer) {
    this.discord.log(`Stopping server: ${home_name}`);
    const response = await this.api.get('gamemanager/stop', { port });

    this.discord.log(`[${home_name}]: ${response.status} ${response.message}`);

    return response;
  }

  async restart({ IpPort: { port }, home_name }: GameServer) {
    this.discord.log(`Restarting server: ${home_name}`);
    const response = await this.api.get('gamemanager/restart', { port });

    this.discord.log(`[${home_name}]: ${response.status} ${response.message}`);

    return response;
  }
}
