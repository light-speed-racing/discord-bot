import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  InjectDiscordClient,
  Param,
  Payload,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, UserMention } from 'discord.js';
import { GuildService } from '../../common/guild.services';
import { Config } from '../../config/config.types';
import { CommandValidationFilter } from '../../filters/command-validation.filter';

class GreetDto {
  @Param({
    name: 'user',
    description: 'Who would you like to greet',
    required: true,
  })
  user: UserMention;
}

@Injectable()
@Command({
  name: 'greet',
  description: 'Greet a user',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class GreetCommand implements DiscordTransformedCommand<GreetDto> {
  private readonly logger = new Logger(GreetCommand.name);

  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
    private readonly guildService: GuildService,
  ) {}

  async handler(@Payload() { user }: GreetDto): Promise<void> {
    this.logger.debug(`Greeting ${user} from the command`);

    const [id] = user.match(/\d+/g);
    const userToGreet = this.guildService.guild.members.cache.get(id);

    if (!userToGreet) {
      return;
    }

    this.client.emit('guildMemberAdd', userToGreet);
  }
}
