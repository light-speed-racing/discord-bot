import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Formatters } from 'discord.js';
import { LoggingChannelService } from 'src/common/logging-channel.service';
import { MemberService } from 'src/common/member.service';
import { RoleService } from 'src/common/role.services';
import { SimgridService } from 'src/common/simgrid.service';
import { championshipRoles, Championships } from 'src/championships';

@Injectable()
export class AssignEventRoleForUsers {
  private readonly logger: Logger = new Logger(AssignEventRoleForUsers.name);

  constructor(
    private readonly sgService: SimgridService,
    private readonly roleService: RoleService,
    private readonly memberService: MemberService,
    private readonly log: LoggingChannelService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug('Running task: `Assign role to user for simgrid events`');

    for (const championship in Championships) {
      const id = Championships[championship];
      const role = championshipRoles[id];

      this.log.send(`Updating roles for ${championship}`);
      const csv = await this.sgService.driversOf(id);
      try {
        csv.forEach(async (row) => {
          const username = row.username;

          const member = await this.memberService.findByUsername(username);

          if (!member) {
            return await this.log.send(
              `${Formatters.bold(username)} has not joined yet`,
            );
          }

          if (this.roleService.has(member, role)) {
            return;
          }
          if (!this.roleService.exists(role)) {
            await this.roleService.create(role);
            this.log.send(`${role} was created`);
          }

          const r = this.roleService.findByName(role);

          const { user } = await member.roles.add(r);
          await this.log.send(
            `${Formatters.bold(
              user.username,
            )} was assigned ${Formatters.roleMention(r.id)}`,
          );
        });
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
}
