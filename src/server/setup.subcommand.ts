import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { ServerConfigDto } from './server-config.dto';
import { ServerService } from './server.service';

@SubCommand({
  name: 'setup',
  description: 'Setup the configuration for a server',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class SetupSubCommand
  implements DiscordTransformedCommand<ServerConfigDto>
{
  constructor(private readonly service: ServerService) {}

  async handler(@Payload() { championship, forceentrylist }: ServerConfigDto) {
    try {
      const entryList = await this.service.entryListFor(
        championship,
        forceentrylist,
      );

      console.log(entryList);

      return 'entryList';
    } catch (error) {
      return error.message;
    }
  }
}
