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
import { Client, UserMention } from 'discord.js';
import { GuildService } from 'src/common/guild.service';
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

  constructor(@InjectDiscordClient() private readonly client: Client) {}

  async handler(@Payload() { user }: GreetDto): Promise<void> {
    this.logger.debug(`Greeting ${user} from the command`);

    const [id] = user.match(/\d+/g);

    const userToGreet = (await GuildService.Members()).cache.get(id);

    if (!userToGreet) {
      return;
    }

    this.client.emit('guildMemberAdd', userToGreet);
  }
}
