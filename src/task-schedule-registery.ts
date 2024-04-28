import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { GameServerService } from './open-game-panel/game-server.service';
import { AbstractScheduler } from './abstract-scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TaskScheduleRegistery implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskScheduleRegistery.name);

  onApplicationBootstrap(): any {
    this.logger.log('Task scheduler has been booting');
    this.registerCronJobs();
  }

  constructor(
    @Inject('SCHEDULES')
    private readonly schedules: AbstractScheduler[],
    private readonly scheduleRegistry: SchedulerRegistry,
    private readonly gameServer: GameServerService,
  ) {}

  async registerCronJobs() {
    this.logger.debug('Registering cron jobs');

    for (const { name, run, timeExpression } of this.schedules) {
      this.logger.log(`${name} cron has added with expression ${timeExpression}`);

      this.scheduleRegistry.addCronJob(
        name,
        new CronJob(
          timeExpression,
          () => {
            this.logger.log(`${name} cron is starting with expression ${timeExpression}`);

            run();
          },
          () => {
            this.logger.log(`${name} cron has completed with expression ${timeExpression}`);
          },
          true,
        ),
      );
    }
  }
}
