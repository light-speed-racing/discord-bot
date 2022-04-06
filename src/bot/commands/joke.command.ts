import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { MessagePayload, InteractionReplyOptions } from 'discord.js';
import { JokeService } from '../services/joke.service';

@Injectable()
@Command({
  name: 'joke',
  description: 'Tell a joke',
})
@UsePipes(TransformPipe)
export class JokeCommand implements DiscordTransformedCommand<undefined> {
  private readonly logger = new Logger(JokeCommand.name);

  constructor(private readonly joke: JokeService) {}

  async handler(
    dto: undefined,
    { interaction }: TransformedCommandExecutionContext<any>,
  ): Promise<string | void | MessagePayload | InteractionReplyOptions> {
    this.logger.debug(interaction);
    return await this.joke.tellJoke();
  }
}
