import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CommonModule } from 'src/common/common.module';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { OpenGamePanelModule } from 'src/open-game-panel/open-game-panel.module';
import { SimgridModule } from 'src/simgrid/simgrid.module';

@Module({
  imports: [SimgridModule, OpenGamePanelModule, CommonModule],
})
export class JobsModule implements OnModuleInit {
  private logger = new Logger(JobsModule.name);

  constructor(
    private readonly scheduler: SchedulerRegistry,
    private readonly event: EventEmitter2,
    private readonly gameServer: GameServerService,
  ) {}

  async onModuleInit() {
    this.registerJobRestartPracticeGameServers();
  }

  private async registerJobRestartPracticeGameServers() {
    // const cronTime = CronExpression.EVERY_DAY_AT_3AM;
    const cronTime = CronExpression.EVERY_10_SECONDS;
    const servers = await this.gameServer.getServersThatShouldHaveARestartJob('practice');

    servers.forEach(async (gameServer) => {
      const name = `job::restart-${gameServer.home_name.replace(/[\W_]+/g, '')}`;

      if (this.scheduler.doesExist('cron', name)) {
        this.logger.warn(`${name} is already registered!`);
        return;
      }

      this.logger.log(`Registering job for: ${name} (${cronTime})`);
      const job = new CronJob(`${cronTime}`, async () => {
        this.event.emit('game-server.restart', gameServer);
      });

      this.scheduler.addCronJob(name, job);
      job.start();
    });
  }
}
