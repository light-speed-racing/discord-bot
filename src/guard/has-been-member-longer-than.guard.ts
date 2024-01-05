import { CanActivate, ExecutionContext } from '@nestjs/common';
import datemath, { Unit } from '@elastic/datemath';
import moment, { Moment } from 'moment';
import { Message } from 'discord.js';

export class HasBeenMemberLongerThan implements CanActivate {
  private date: Moment;
  constructor(number: number, unit: Unit) {
    this.date = datemath.parse(`now-${number}${unit}`);
  }

  canActivate(context: ExecutionContext): boolean {
    const { member } = context.getArgByIndex<Message>(0);

    return moment(member.joinedAt).isBefore(this.date);
  }
}
