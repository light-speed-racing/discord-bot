import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { BaseCommand } from 'src/common/base.command';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { SteerlockDto } from './steerlock.dto';
import data from './steerlocks.json';

@Injectable()
@Command({
  name: 'steerlock',
  description: 'Need to know the steerlock of a car?',
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter)
export class SteerlockCommand
  extends BaseCommand
  implements DiscordTransformedCommand<SteerlockDto>
{
  async handler(@Payload() { car }: SteerlockDto): Promise<string> {
    const response = data
      .filter((d) => d.car.toLowerCase().includes(car.toLowerCase()))
      .map((r) => `Steerlock for: **${r.car}** is **${r.value}**`)
      .join('\n');

    if (!response) {
      return 'Car not found';
    }

    return response;
  }
}
