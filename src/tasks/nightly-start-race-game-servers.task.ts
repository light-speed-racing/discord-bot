import { Injectable } from '@nestjs/common';
import { AbstractScheduler } from './abstract-scheduler';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { SimgridService } from 'src/simgrid/simgrid.service';
import { CronJob } from 'cron';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { GameServer } from 'src/database/game-server.entity';
import { time } from 'discord.js';

@Injectable()
export class NightlyStartRaceGameServersTask extends AbstractScheduler {
  public name = `${NightlyStartRaceGameServersTask.name}-with-serverType-RACE`;
  public timeExpression = CronExpression.EVERY_DAY_AT_6PM;

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
      const { simgrid_id } = server.custom_fields;
      const taskName = this.taskName(server);
      const simgridEvent = await this.simgrid.nextRaceOfChampionship(simgrid_id);
      if (!simgridEvent) {
        this.discord.log(
          `The simgrid event with id ${simgrid_id} does not have any races following ${new Date().toISOString()}`,
        );
        return;
      }
      if (this.scheduleRegistry.doesExist('cron', taskName)) {
        this.discord.log(`Cron job ${taskName} already exists. Removing it...`);

        this.scheduleRegistry.deleteCronJob(taskName);
      }

      this.discord.log(
        `**${server.home_name}** will start at ${time(new Date(simgridEvent.starts_at), 'F')}
        `,
      );

      const job = new CronJob(new Date(simgridEvent.starts_at), async () => {
        await this.gameManager.start(server);
      });

      this.scheduleRegistry.addCronJob(taskName, job);

      job.start();
    }
  };

  private readonly taskName = ({ home_name }: GameServer) => {
    return `start-${home_name.replace(/[\W_]+/gim, '_').toLowerCase()}-task`;
  };
}
