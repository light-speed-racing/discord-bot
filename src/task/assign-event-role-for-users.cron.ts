import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemberService } from '../common/member.service';
import { RoleService } from '../common/role.services';
import { championships } from '../championships';
import { SimgridService } from '../common/simgrid.service';
import { LoggingChannelService } from '../common/logging-channel.service';
import { Formatters } from 'discord.js';

@Injectable()
export class AssignEventRoleForUsers {
  private readonly logger: Logger = new Logger(AssignEventRoleForUsers.name);

  constructor(
    private readonly sgService: SimgridService,
    private readonly roleService: RoleService,
    private readonly memberService: MemberService,
    private readonly loggingChannel: LoggingChannelService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Running task: `Assign role to user for simgrid events`');
    // this.loggingChannel.send(
    //   'Running task: `Assign role to user for simgrid events`',
    // );
    for (const { id, name, role: roleName, driverSwap } of championships) {
      this.logger.debug(`Updating roles for ${id} ${name ?? roleName}`);
      // this.loggingChannel.send(`Updating roles for ${id} ${name ?? roleName}`);
      const csv = await this.sgService.driversOf(id, driverSwap);

      try {
        csv.forEach(async ({ username, ...row }) => {
          const member =
            (await this.memberService.find(username)) ??
            (await this.memberService.find(row['real name']));

          if (!member) {
            this.logger.debug(
              `Member ${username} (${row['real name']}) not found for ${
                name ?? roleName
              }`,
            );
            return;
          }

          if (await this.roleService.has(member, roleName)) {
            return;
          }
          const role = (await this.roleService.exists(roleName))
            ? await this.roleService.findByName(roleName)
            : await this.roleService.create(roleName);

          if (!role) {
            return;
          }

          const { user } = await member.roles.add(role);
          this.logger.debug(
            `${role.name} was assigned to ${user.username ?? username}`,
          );
          // this.loggingChannel.send(
          //   `${role.name} was assigned to ${user.username ?? username}`,
          // );
        });
      } catch (error) {
        this.logger.error(error);
        this.loggingChannel.send(`ERROR: ${Formatters.codeBlock(error)}`);
        continue;
      }
    }
  }
}
