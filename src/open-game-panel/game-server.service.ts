import { Injectable, Logger } from '@nestjs/common';
import { GameServer, GameServerKind } from 'src/database/game-server.entity';
import { Not, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigurationJSON, EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { FileManager } from './file-manager.service';
import { WeatherService } from 'src/common/weather.service';
import { SimgridService } from 'src/simgrid/simgrid.service';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly fileManager: FileManager,
    private readonly weather: WeatherService,
    private readonly simgrid: SimgridService,
  ) {}

  async homedir(home_path: string): Promise<GameServer> {
    return await this.repository.findOneByOrFail({ home_path });
  }

  async getServersThatShouldHaveARestartJob(server_type: GameServerKind) {
    return (await this.repository.findBy({ custom_fields: Not(IsNull()) }))
      .filter((entry) => !!entry.custom_fields)
      .filter(({ custom_fields }) => !!custom_fields.is_enabled && custom_fields.server_type === server_type)
      .filter(({ custom_fields }) => !!custom_fields.simgrid_id && !!custom_fields.live_weather)
      .filter(Boolean);
  }

  async updateTrack(entity: GameServer, track: Track) {
    await this.fileManager.update<EventJSON>('event.json', { track }, entity);
  }

  async updateConfigurationJson(entity: GameServer) {
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

  async updateEventJsonWithTrackAndWeather(entity: GameServer) {
    this.logger.debug(`updateWeather: ${entity.home_name}`);
    const { custom_fields } = entity;
    if (!custom_fields.is_enabled && !custom_fields?.live_weather) {
      return;
    }

    const eventJSON = await this.fileManager.read<EventJSON>('event.json', entity);

    const { in_game_name } = await this.simgrid.nextRaceOfChampionship(entity.custom_fields.simgrid_id);

    const data = {
      ...eventJSON,
      track: in_game_name,
      ...(await this.weather.forecastFor(in_game_name)).at('15:00'),
    } as EventJSON;

    console.log(data);
    await this.fileManager.write<EventJSON>('event.json', data, entity);

    return data;
  }
}
