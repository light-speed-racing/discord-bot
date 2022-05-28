import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  TransformedCommandExecutionContext,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'prettier';
import { FtpService } from 'src/common/ftp.service';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { RoleGuard } from 'src/guards/role.guard';
import { EntryListDto } from '../dto/entry-list.dto';
import { ServerService } from '../server.service';
import { $enum } from 'ts-enum-util';
import { Championships } from '../enum/championships.enum';
import { Formatters } from 'discord.js';

@SubCommand({
  name: 'entrylist',
  description: 'Sync the entrylist for a championship',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class EntryListSubCommand
  implements DiscordTransformedCommand<EntryListDto>
{
  private readonly logger: Logger = new Logger(EntryListSubCommand.name);

  constructor(
    private readonly service: ServerService,
    private readonly config: ConfigService<Config>,
    private readonly ftp: FtpService,
  ) {}

  @UseGuards(new RoleGuard('admin', 'host', 'moderator', 'steward'))
  async handler(@Payload() { championship, forceentrylist }: EntryListDto) {
    const name =
      Object.keys(Championships)[
        Object.values(Championships).indexOf(championship)
      ];
    await this.service.entryListFor(championship, forceentrylist);

    await this.ftp.uploadFile(
      ServerService.serverConfigTempPath,
      'entrylist.json',
    );

    return `Entrylist for ${Formatters.bold(
      name,
    )} was updated. To apply it the server needs to be restarted`;
  }
}
