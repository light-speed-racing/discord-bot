import { Injectable, Logger } from '@nestjs/common';
import { GuildMember } from 'discord.js';
import { GuildService } from './guild.services';

@Injectable()
export class MemberService {
  private readonly logger: Logger = new Logger(MemberService.name);

  constructor(private readonly guilsService: GuildService) {}

  async find(query: string): Promise<GuildMember | null> {
    try {
      const found = (
        await this.guilsService.guild.members.search({
          query,
          limit: 1,
          cache: false,
        })
      ).first();

      return found ?? null;
    } catch (error: any) {
      this.logger.warn('Failed to fetch guildmember', error);
      return;
    }
  }
}
