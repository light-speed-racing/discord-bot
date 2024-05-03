import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AbstractScheduler } from './abstract-scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DiscordChannelService } from 'src/common/discord-channel.service';

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
    private readonly discord: DiscordChannelService,
  ) {}

  async registerCronJobs() {
    this.logger.debug('Registering cron jobs');
    this.discord.log('Registering cron jobs');

    for (const { name, run, timeExpression } of this.schedules) {
      if (this.scheduleRegistry.doesExist('cron', name)) {
        this.scheduleRegistry.deleteCronJob(name);
      }

      this.logger.debug(`${name} cron has added with expression ${timeExpression}`);
      this.discord.log(`${name} cron has added with expression ${timeExpression}`);

      this.scheduleRegistry.addCronJob(
        name,
        new CronJob(
          timeExpression,
          () => {
            this.logger.debug(`${name} cron is starting with expression ${timeExpression}`);
            this.discord.log(`${name} cron is starting with expression ${timeExpression}`);
            run();
          },
          () => {
            this.logger.debug(`${name} cron has completed with expression ${timeExpression}`);
            this.discord.log(`${name} cron has completed with expression ${timeExpression}`);
          },
          true,
        ),
      );
    }
  }
}
