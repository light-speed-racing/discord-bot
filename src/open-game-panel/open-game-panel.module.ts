import { Module } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { Server } from 'src/database/server.entity';
import { IpPort } from 'src/database/ip-port.entity';
import { ApiToken } from 'src/database/api-token.entity';
import { OpenGamePanelApi } from './open-game-panel-api.service';
import { HttpModule } from '@nestjs/axios';
import { GameManager } from './game-manager.service';
import { FileManager } from './file-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameServer, Server, IpPort, ApiToken]), HttpModule],
  providers: [GameServerService, OpenGamePanelApi, GameManager, FileManager],
  exports: [GameServerService, OpenGamePanelApi, GameManager, FileManager],
})
export class OpenGamePanelModule {}
