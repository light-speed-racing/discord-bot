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
import { Config } from 'src/config/config.types';
import { DiscordConfig } from 'src/config/discord.config';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';

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
  ) {}

  async handler(@Payload() { user }: GreetDto): Promise<void> {
    this.logger.debug(`Greeting ${user} from the command`);

    const { members } = this.client.guilds.cache.get(
      this.config.get<DiscordConfig>('discord').guildId,
    );
    const [id] = user.match(/\d+/g);
    const userToGreet = members.cache.get(id);

    if (!userToGreet) {
      return;
    }

    this.client.emit('guildMemberAdd', userToGreet);
  }
}
