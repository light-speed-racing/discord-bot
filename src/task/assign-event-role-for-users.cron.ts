import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemberService } from '../common/member.service';
import { RoleService } from '../common/role.services';
import { championships } from '../championships';
import { SimgridService } from '../common/simgrid.service';

@Injectable()
export class AssignEventRoleForUsers {
  private readonly logger: Logger = new Logger(AssignEventRoleForUsers.name);

  constructor(
    private readonly sgService: SimgridService,
    private readonly roleService: RoleService,
    private readonly memberService: MemberService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Running task: `Assign role to user for simgrid events`');

    for (const { id, name, role, isTeamEvent } of championships) {
      this.logger.debug(`Updating roles for ${name}`);
      const csv = await this.sgService.driversOf(id, isTeamEvent);

      try {
        csv.forEach(async ({ username }) => {
          const member = await this.memberService.findByUsername(username);
          if (!member) {
            return;
          }

          if (await this.roleService.has(member, role)) {
            return;
          }
          const newRole = (await this.roleService.exists(role))
            ? await this.roleService.findByName(role)
            : await this.roleService.create(role);

          if (!newRole) {
            return;
          }

          const { user } = await member.roles.add(newRole);
          this.logger.debug(
            `${newRole.name} was assigned to ${user.username ?? username}`,
          );
        });
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
}
