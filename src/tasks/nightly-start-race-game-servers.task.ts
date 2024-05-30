import { Injectable, Logger } from '@nestjs/common';
import { AbstractScheduler } from './abstract-scheduler';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { Race, SimgridService } from 'src/simgrid/simgrid.service';
import { CronJob } from 'cron';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { GameServer } from 'src/database/game-server.entity';
import { time } from 'discord.js';

@Injectable()
export class NightlyStartRaceGameServersTask extends AbstractScheduler {
  name = `${NightlyStartRaceGameServersTask.name}-with-serverType-RACE`;
  timeExpression = CronExpression.EVERY_HOUR;

  private readonly logger = new Logger(NightlyStartRaceGameServersTask.name);

  constructor(
    private readonly gameServer: GameServerService,
    private readonly gameManager: GameManager,
    private readonly simgrid: SimgridService,
    private readonly scheduleRegistry: SchedulerRegistry,
    private readonly discord: DiscordChannelService,
  ) {
    super();
  }

  run = async () => {
    this.discord.log(`Running ${this.name} job...`);

    const servers = await this.gameServer.getServersThatShouldHaveARestartJob('race');

    for (const server of servers) {
      this.processGameServer(server);
    }
  };

  processGameServer = async (server: GameServer) => {
    const {
      custom_fields: { simgrid_id },
      home_name,
    } = server;
    const race = await this.simgrid.nextRaceOfChampionship(simgrid_id);
    this.logger.debug(`[${home_name}]: Next race will be at ${race.track} on ${race.starts_at}`, race);
    const taskName = this.taskName(server);

    if (!race) {
      this.discord.log(`${home_name} does not have any races following ${new Date().toISOString()}`);
      this.logger.warn(`${home_name} does not have any races following ${new Date().toISOString()}`);

      return;
    }

    await this.deleteJobIfExists(taskName);

    const job = await this.createAndRegisterJob(server, race);
    job.addCallback(async () => {
      await this.gameManager.start(server);
    });
    job.start();
    this.discord.log(`**${home_name}** will start at ${time(new Date(race.starts_at), 'F')}`);
  };

  private createAndRegisterJob = async (server: GameServer, { starts_at }: Race) => {
    const taskName = this.taskName(server);
    const job = new CronJob(new Date(starts_at), () => {
      this.logger.debug(`Running job ${taskName}...`, server);
    });

    this.scheduleRegistry.addCronJob(taskName, job);

    return Promise.resolve(job);
  };

  private deleteJobIfExists = async (taskName: string) => {
    this.logger.verbose(`deleteJobIfExists: ${taskName}`);
    if (!this.scheduleRegistry.doesExist('cron', taskName)) {
      this.logger.debug(`${taskName} does not exist`);
      return Promise.resolve();
    }
    this.logger.debug(`Cron job ${taskName} already exists. Removing it...`);

    this.scheduleRegistry.deleteCronJob(taskName);
    return Promise.resolve();
  };

  private readonly taskName = ({ home_name }: GameServer) => {
    return `start-${home_name.replace(/[\W_]+/gim, '_').toLowerCase()}-task`;
  };
}
