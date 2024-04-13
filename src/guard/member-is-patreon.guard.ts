import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Patreons } from 'src/patreons';
import { Message } from 'discord.js';

export class MemberIsPatreon implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { member } = context.getArgByIndex<Message>(0);

    return Array.from(Patreons).some(([, value]) => `${value.discordId}` === member.id);
  }
}
