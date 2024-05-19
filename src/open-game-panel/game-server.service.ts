import { Injectable, Logger } from '@nestjs/common';
import { GameServer, GameServerType } from 'src/database/game-server.entity';
import { Not, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileManager } from './file-manager.service';
import { ConfigurationJSON, EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { WeatherService } from 'src/common/weather.service';
import { SimgridService } from 'src/simgrid/simgrid.service';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);

  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly simgrid: SimgridService,
    private readonly fileManager: FileManager,
    private readonly weather: WeatherService,
  ) {}

  homedir = async (home_path: string): Promise<GameServer> => {
    this.logger.log('Getting custom fields for:', home_path);

    const entity = await this.repository.findOneByOrFail({ home_path });

    this.logger.log('Found:', JSON.stringify(entity));

    return entity;
  };

  getServersThatShouldHaveARestartJob = async (serverType: GameServerType) => {
    return (await this.repository.findBy({ custom_fields: Not(IsNull()) }))
      .filter((entry) => !!entry.custom_fields)
      .filter(({ custom_fields }) => !!custom_fields.is_enabled)
      .filter(({ custom_fields }) => !!custom_fields.simgrid_id && !!custom_fields.live_weather)
      .filter(({ custom_fields }) => custom_fields?.server_type === serverType)
      .filter(Boolean);
  };

  updateConfigurationJson = async (entity: GameServer): Promise<void> => {
    const {
      home_name,
      IpPort: { port },
    } = entity;
    this.logger.debug(`updateConfigurationJson: ${home_name}`);
    if (await this.fileManager.isEmpty('configuration.json', entity)) {
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

    if (!currentConfiguration) {
      this.logger.debug(`No confiuguration.json was found`);
    }

    if (currentConfiguration.tcpPort === port && currentConfiguration.udpPort === port) {
      return;
    }
    await this.fileManager.update(
      'configuration.json',
      { ...currentConfiguration, tcpPort: port, udpPort: port },
      entity,
    );

    return;
  };

  updateEventJson = async (entity: GameServer): Promise<EventJSON> => {
    this.logger.debug(`updateWeather: ${entity.home_name}`);
    const { custom_fields } = entity;
    if (!custom_fields.is_enabled && !custom_fields?.live_weather && !custom_fields.simgrid_id) {
      return;
    }

    const eventJSON = await this.fileManager.read<EventJSON>('event.json', entity);
    const track = (await this.getTrackForNextEvent(entity)) ?? eventJSON.track;
    const forecast = await this.weather.forecastFor(track);

    const data = {
      ...eventJSON,
      ...forecast,
      track,
    };

    await this.fileManager.write<EventJSON>('event.json', data, entity);

    return data;
  };

  private getTrackForNextEvent = async (entity: GameServer): Promise<Track | undefined> => {
    this.logger.debug(`getTrackForNextEvent: ${entity.home_name}`);

    if (!entity.custom_fields?.simgrid_id) {
      return undefined;
    }

    const event = await this.simgrid.nextRaceOfChampionship(entity.custom_fields.simgrid_id);

    if (!event) {
      return undefined;
    }

    return event.in_game_name;
  };
}
