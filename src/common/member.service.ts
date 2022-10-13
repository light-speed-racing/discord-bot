import { Injectable, Logger } from '@nestjs/common';
import { GuildMember } from 'discord.js';
import { GuildService } from './guild.service';

@Injectable()
export class MemberService {
  private readonly logger: Logger = new Logger(MemberService.name);

  async find(query: string): Promise<GuildMember | null> {
    try {
      const found = (await GuildService.Guild()).members.search({
        query,
        limit: 1,
        cache: false,
      });

      return (await found).first() ?? null;
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember', error);
      return;
    }
  }
}
