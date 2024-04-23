import { Injectable, Logger } from '@nestjs/common';
import { GameServer, GameServerKind } from 'src/database/game-server.entity';
import { Not, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RootConfig } from 'src/config/config';
import { ConfigurationJSON, EventJSON } from 'src/assetto-corsa-competizione.types';
import { FileManager } from './file-manager.service';
import { WeatherService } from 'src/common/weather.service';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly config: RootConfig,
    private readonly fileManager: FileManager,
    private readonly weather: WeatherService,
  ) {}

  async homedir(home_path: string): Promise<GameServer> {
    return await this.repository.findOneByOrFail({ home_path });
  }

  async getServersThatShouldHaveARestartJob(server_type: GameServerKind) {
    return (await this.repository.findBy({ custom_fields: Not(IsNull()) }))
      .filter((entry) => !!entry.custom_fields)
      .filter(({ custom_fields }) => !!custom_fields.is_enabled && custom_fields.server_type === server_type)
      .filter(({ custom_fields }) => !!custom_fields.simgrid_id && !!custom_fields.live_weather)
      .filter(({ home_id }) => this.config.env === 'development' && home_id === 25 /*|| home_id === 6 */) // @TODO: This needs to be removed
      .filter(Boolean);
  }

  async runPrestart(homedir: string) {
    const entity = await this.homedir(homedir);
    await this.updateConfigurationJson(entity);

    if (entity.custom_fields?.live_weather) {
      await this.updateWeather(entity);
    }
    return entity;
  }

  private async updateConfigurationJson(entity: GameServer) {
    this.logger.debug(`updateConfigurationJson: ${entity.home_name}`);
    const {
      IpPort: { port },
    } = entity;
    const configurationIsEmpty = await this.fileManager.isEmpty('configuration.json', entity);
    if (configurationIsEmpty) {
      const content = {
        lanDiscovery: 1,
        maxConnections: 250,
        registerToLobby: 1,
        configVersion: 1,
        tcpPort: port,
        udpPort: port,
      };
      await this.fileManager.write<ConfigurationJSON>('configuration.json', content, entity);

      return;
    }
    const currentConfiguration = await this.fileManager.read<ConfigurationJSON>('configuration.json', entity);

    const content = { ...currentConfiguration, tcpPort: port, udpPort: port } as ConfigurationJSON;

    if (currentConfiguration.tcpPort === port && currentConfiguration.udpPort === port) {
      return;
    }
    await this.fileManager.update('configuration.json', content, entity);

    return content;
  }

  private async updateWeather(entity: GameServer) {
    this.logger.debug(`updateWeather: ${entity.home_name}`);
    const { custom_fields } = entity;
    if (!custom_fields.is_enabled && !custom_fields?.live_weather) {
      return;
    }

    const eventJSON = await this.fileManager.read<EventJSON>('event.json', entity);

    const data = {
      ...eventJSON,
      ...(await this.weather.forecastFor(eventJSON.track)).at('15:00'),
    } as EventJSON;

    await this.fileManager.write<EventJSON>('event.json', data, entity);

    return data;
  }
}
