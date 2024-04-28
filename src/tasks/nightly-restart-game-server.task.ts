import { Injectable } from '@nestjs/common';
import { AbstractScheduler } from '../abstract-scheduler';
import { CronExpression } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { BopProvider, GameServer } from 'src/database/game-server.entity';
import { WeatherService } from 'src/common/weather.service';
import { SimgridService } from 'src/simgrid/simgrid.service';

@Injectable()
export class NightlyRestartGameServerTask extends AbstractScheduler {
  public name = 'restart-all-game-servers-with-serverType-PRACTICE';
  public timeExpression: string = CronExpression.EVERY_DAY_AT_3AM;

  constructor(
    private readonly gameServer: GameServerService,
    private readonly fileManager: FileManager,
    private readonly bop: BalanceOfPerformanceService,
    private readonly weather: WeatherService,
    private readonly simgrid: SimgridService,
  ) {
    super();
  }

  public async run() {
    console.log(`Running task for ${this.name}`);
    const servers = await this.gameServer.getServersThatShouldHaveARestartJob('practice');

    for (const server of servers) {
      const { bop_provider } = server.custom_fields;

      const eventJson = await this.fileManager.read<EventJSON>('event.json', server);

      await this.gameServer.updateConfigurationJson(server);
      await this.updateBop(eventJson.track, bop_provider, server);
      await this.updateEvent(server, eventJson);
    }
  }

  private async updateEvent(gameServer: GameServer, currentConfig: EventJSON) {
    const { in_game_name } = await this.simgrid.nextRaceOfChampionship(gameServer.custom_fields.simgrid_id);

    const weather = await this.weather.forecastFor(in_game_name);

    await this.fileManager.write(
      'event.json',
      {
        ...currentConfig,
        ...weather.at('15:00'),
        track: in_game_name,
      },
      gameServer,
    );

    return;
  }

  private async updateBop(track: Track, provider: BopProvider, server: GameServer) {
    const { entries } = await this.bop.fetch(provider);
    const content = { entries: entries?.filter((entry) => entry.track === track) };

    await this.fileManager.write('bop.json', content, server);

    return;
  }
}
