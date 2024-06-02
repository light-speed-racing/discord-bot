import { Injectable, Logger } from '@nestjs/common';
import {
  AssistRulesJSON,
  ConfigurationJSON,
  Entrylist,
  EventJSON,
  EventRulesJSON,
} from 'src/assetto-corsa-competizione.types';
import { WeatherService } from 'src/common/weather.service';
import { GameServer } from 'src/database/game-server.entity';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EntrylistService } from 'src/simgrid/entrylist.service';
import { Race, SimgridService } from 'src/simgrid/simgrid.service';

@Injectable()
export class ServerTaskManager {
  private readonly logger = new Logger(ServerTaskManager.name);
  protected race?: Race = undefined;

  constructor(
    private readonly entrylistService: EntrylistService,
    private readonly weatherService: WeatherService,
    private readonly simgridService: SimgridService,
    private readonly filemanager: FileManager,
  ) {}

  async entrylist(server: GameServer): Promise<{ message: string; data: Entrylist }> {
    this.logger.debug(`[${server.home_id}] ${server.home_name}: Fetching entrylist`);
    try {
      if (!server.custom_fields?.simgrid_id) {
        throw `[${server.home_id}] ${server.home_name}: Simgrid ID is missing`;
      }
      const content = await this.entrylistService.fetch(server.custom_fields?.simgrid_id);

      return await this.filemanager.write<Entrylist>('entrylist.json', content, server);
    } catch (error) {
      throw new Error(`Error fetching entrylist, ${error}`);
    }
  }

  async configuration(server: GameServer): Promise<{ message: string; data: ConfigurationJSON }> {
    const existing = (await this.filemanager.read<ConfigurationJSON>('configuration.json', server)) ?? {};
    const data: ConfigurationJSON = {
      lanDiscovery: 1,
      maxConnections: 250,
      registerToLobby: 1,
      ...existing,
      tcpPort: server.IpPort.port,
      udpPort: server.IpPort.port,
    };
    return await this.filemanager.update<ConfigurationJSON>('configuration.json', data, server);
  }

  async event(server: GameServer): Promise<{ message: string; data: EventJSON }> {
    const weather = await this.weather(server);

    const existing = await this.filemanager.read<EventJSON>('event.json', server);

    const data = {
      ...existing,
      ...weather,
      track: this.race?.in_game_name ?? weather.track ?? 'snetterton',
    };

    return await this.filemanager.update<EventJSON>('event.json', data, server);
  }

  async eventRules(server: GameServer): Promise<{ message: string; data: EventRulesJSON }> {
    const existing = await this.filemanager.read<EventRulesJSON>('eventRules.json', server);
    const data = {
      ...existing,
      qualifyStandingType: 1,
      pitWindowLengthSec: -1,
      driverStintTimeSec: -1,
      isRefuellingAllowedInRace: true,
      isRefuellingTimeFixed: false,
      maxDriversCount: -1,
      mandatoryPitstopCount: 0,
      maxTotalDrivingTime: -1,
      isMandatoryPitstopRefuellingRequired: true,
      isMandatoryPitstopTyreChangeRequired: false,
      isMandatoryPitstopSwapDriverRequired: false,
      tyreSetCount: 50,
    };

    return await this.filemanager.update<EventRulesJSON>('eventRules.json', data, server);
  }

  async assistRules(server: GameServer): Promise<{ message: string; data: AssistRulesJSON }> {
    const existing = await this.filemanager.read<AssistRulesJSON>('assistRules.json', server);

    const data = {
      ...existing,
      disableIdealLine: 0,
      disableAutosteer: 0,
      stabilityControlLevelMax: 0,
      disableAutoPitLimiter: 0,
      disableAutoGear: 0,
      disableAutoClutch: 0,
      disableAutoEngineStart: 0,
      disableAutoWiper: 0,
      disableAutoLights: 0,
    };

    return await this.filemanager.update<AssistRulesJSON>('assistRules.json', data, server);
  }

  private nextRaceOfChampionship = async ({ home_id, home_name, custom_fields }: GameServer): Promise<Race> => {
    this.logger.debug(`[${home_id}] ${home_name}: Finding next race of championship ${custom_fields?.simgrid_id}`);

    if (this.race) {
      return this.race;
    }

    try {
      if (!custom_fields?.simgrid_id) {
        throw new Error(`[${home_id}] ${home_name}: Simgrid ID is missing`);
      }

      const race = await this.simgridService.nextRaceOfChampionship(custom_fields?.simgrid_id);
      if (!race) {
        throw new Error(
          `[${home_id}] ${home_name}: No race was found on Simgrid with the ID ${custom_fields?.simgrid_id}`,
        );
      }
      this.race = race;
      return race;
    } catch (error) {
      throw new Error(error);
    }
  };

  private weather = async (server: GameServer): Promise<Partial<EventJSON>> => {
    await this.nextRaceOfChampionship(server);

    if (!this.race?.in_game_name) {
      throw new Error(`[${server.home_id}] ${server.home_name}: The race does not seem to have an ingame name`);
    }

    return await this.weatherService.forecastFor(this.race.in_game_name);
  };
}
