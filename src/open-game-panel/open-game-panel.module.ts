import { Module } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { Server } from 'src/database/server.entity';
import { IpPort } from 'src/database/ip-port.entity';
import { OpenGamePanelApi } from './open-game-panel-api.service';
import { HttpModule } from '@nestjs/axios';
import { GameManager } from './game-manager.service';
import { FileManager } from './file-manager.service';
import { DiscordModule } from '@discord-nestjs/core';
import { CommonModule } from 'src/common/common.module';
import { SimgridModule } from 'src/simgrid/simgrid.module';
import { RestartGameServerSubcommand } from './commands/restart-game-server.subcommand';
import { GameServerCommand } from './commands/game-server.command';
import { StartGameServerSubcommand } from './commands/start-game-server.subcommand';
import { StopGameServerSubcommand } from './commands/stop-game-server.subcommand';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameServer, Server, IpPort]),
    DiscordModule.forFeature(),
    HttpModule,
    CommonModule,
    SimgridModule,
  ],
  providers: [
    GameServerService,
    OpenGamePanelApi,
    GameManager,
    FileManager,
    GameServerCommand,
    RestartGameServerSubcommand,
    StartGameServerSubcommand,
    StopGameServerSubcommand,
  ],
  exports: [GameServerService, OpenGamePanelApi, GameManager, FileManager],
})
export class OpenGamePanelModule {}
