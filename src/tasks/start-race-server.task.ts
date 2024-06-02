import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { ServerTaskManager } from './server-task.manager';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { SettingsJSON } from 'src/assetto-corsa-competizione.types';
import { GameServer } from 'src/database/game-server.entity';
import { SimgridService } from 'src/simgrid/simgrid.service';
import moment from 'moment';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class StartRaceServerTask implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartRaceServerTask.name);

  constructor(
    private readonly gameServer: GameServerService,
    private readonly gameManager: GameManager,
    private readonly manager: ServerTaskManager,
    private readonly simgrid: SimgridService,
    private readonly filemanager: FileManager,
    private readonly discord: DiscordChannelService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    this.handle();
  }

  DURARION_IN_MINUTES = 10;

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handle() {
    const servers = await this.gameServer.serverByType('race');

    for (const server of servers) {
      try {
        this.logger.verbose(`[${server.home_id}] ${server.home_name}: Processing....`);
        const race = await this.simgrid.nextRaceOfChampionship(server.custom_fields?.simgrid_id);
        if (!race) {
          continue;
        }
        const name = this.name(server);

        if (!moment(race.starts_at).isBetween(moment(), moment().add(this.DURARION_IN_MINUTES, 'minutes'))) {
          this.logger.debug(`The race is not within the next ${this.DURARION_IN_MINUTES} minutes. Skipping....`);
          continue;
        }

        if (this.schedulerRegistry.doesExist('timeout', name)) {
          this.logger.debug(`A task for ${name} has already been registered. Skipping....`);
          continue;
        }

        await this.updateFiles(server);

        const milliseconds = moment(race.starts_at).diff(moment());

        const callback = async () => {
          this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
          const settings = await this.filemanager.read<SettingsJSON>('settings.json', server);
          this.discord.log(`Restarted server: ${server.home_name}`);
          const result = await this.gameManager.restart(server);

          this.logger.verbose(settings.serverName, result);
        };

        const timeout = setTimeout(callback, milliseconds);
        this.schedulerRegistry.addTimeout(name, timeout);

        this.discord.log(
          `Scheduled server start: ${server.home_name} in ${milliseconds}ms (${moment()
            .add(milliseconds, 'milliseconds')
            .format('YYYY-MM-DD HH:mm')})`,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  private name(server: GameServer) {
    return `start-${server.home_id}-task`;
  }

  private async updateFiles(server: GameServer) {
    await this.manager.configuration(server);
    await this.manager.event(server);
    await this.manager.eventRules(server);
    await this.manager.assistRules(server);
  }
}
