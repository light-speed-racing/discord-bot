import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { SteerlockDto } from './steerlock.dto';
import data from './steerlocks.json';

@Injectable()
@Command({
  name: 'steerlock',
  description: 'Need to know the steerlock of a car?',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class SteerlockCommand
  implements DiscordTransformedCommand<SteerlockDto>
{
  private readonly logger = new Logger(SteerlockCommand.name);

  async handler(
    @Payload() { car }: SteerlockDto,
    { interaction: { user } }: TransformedCommandExecutionContext<any>,
  ): Promise<string> {
    this.logger.debug(`Finding steerlock for (car: ${car}, user: ${user.tag})`);

    const response = data
      .filter((d) => d.car.toUpperCase().includes(car))
      .map((r) => `Steerlock for: **${r.car}** is **${r.value}**`)
      .join('\n');

    if (!response) {
      this.logger.debug(`Data was not found`);
      return 'Car not found';
    }

    return response;
  }
}
