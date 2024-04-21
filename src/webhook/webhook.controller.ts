import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { EntrylistService } from '../simgrid/entrylist.service';
import { GameServerService } from '../open-game-panel/game-server.service';
import { BopJSON, ConfigurationJSON, Entrylist } from 'src/assetto-corsa-competizione.types';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameServer } from 'src/database/game-server.entity';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);

  constructor(
    private readonly entrylist: EntrylistService,
    private readonly bop: BalanceOfPerformanceService,
    private readonly gameServer: GameServerService,
    private readonly fileManager: FileManager,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get('/')
  async helloWorld() {
    return 'Hello World';
  }

  @Post('bop')
  async getBop(@Body() { homedir }: PreStartDto): Promise<BopJSON> {
    const entity = !!homedir && (await this.gameServer.homedir(homedir));

    if (!entity.custom_fields?.is_enabled) {
      return;
    }

    return await this.bop.fetch(entity.custom_fields?.bop_provider);
  }

  @Post('entrylist')
  async getEntrylist(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    this.logger.log('Incoming request', { homedir });
    const entity = !!homedir && (await this.gameServer.homedir(homedir));

    await this.updateConfigurationJson(entity);

    if (!entity.custom_fields?.is_enabled) {
      return;
    }

    await this.eventEmitter.emitAsync('game-server.starting', { entity });

    if (!entity.custom_fields?.simgrid_id) {
      return EntrylistService.emptyEntrylist;
    }

    await this.eventEmitter.emitAsync('game-server.started', { entity });

    return await this.entrylist.fetch(entity.custom_fields?.simgrid_id);
  }

  private updateConfigurationJson = async (entity: GameServer): Promise<void> => {
    const {
      home_name,
      IpPort: { port },
    } = entity;
    this.logger.debug(`updateConfigurationJson: ${home_name}`);
    if (await this.fileManager.isEmpty('configuration.json', entity)) {
      await this.fileManager.write<ConfigurationJSON>(
        'configuration.json',
        { lanDiscovery: 1, maxConnections: 250, registerToLobby: 1, configVersion: 1, tcpPort: port, udpPort: port },
        entity,
      );

      return;
    }
    const existing = await this.fileManager.read<ConfigurationJSON>('configuration.json', entity);

    if (!existing) {
      this.logger.debug(`No confiuguration.json was found`);
    }

    if (existing.tcpPort === port && existing.udpPort === port) {
      return;
    }
    await this.fileManager.update('configuration.json', { ...existing, tcpPort: port, udpPort: port }, entity);

    return;
  };
}
