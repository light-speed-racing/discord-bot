import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Championships } from 'src/championships';
import { FtpService } from 'src/common/ftp.service';
import { SimgridService } from 'src/common/simgrid.service';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { EntryListDto } from './entrylist.dto';

@SubCommand({
  name: 'entrylist',
  description: 'Sync the configuration for a championship',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class EntryListSubCommand
  implements DiscordTransformedCommand<EntryListDto>
{
  private readonly logger: Logger = new Logger(EntryListSubCommand.name);
  private readonly serverConfigTempPath = join(
    __dirname,
    '..',
    '..',
    '__server-config__',
  );

  constructor(
    private readonly service: SimgridService,
    private readonly ftp: FtpService,
  ) {}

  // TODO: only allow if you have one of these roles
  // @UseGuards(new HasRoleGuard('host', 'moderator', 'steward', 'admin'))
  async handler(
    @Payload() { championship, forceentrylist, teamevent }: EntryListDto,
  ) {
    try {
      const result = await this.service.jsonEntryListFor(
        championship,
        forceentrylist,
        teamevent,
      );

      this.store(JSON.stringify(result, null, 2), 'entrylist.json');
      this.ftp.uploadFile(this.serverConfigTempPath, 'entrylist.json');

      const name =
        Object.keys(Championships)[
          Object.values(Championships).indexOf(championship)
        ];

      return `The entrylist for ${name} has been updated`;
    } catch (error) {
      return error.message;
    }
  }

  private store(content: string, filename: string) {
    if (!existsSync(this.serverConfigTempPath)) {
      mkdirSync(this.serverConfigTempPath);
    }

    return writeFileSync(join(this.serverConfigTempPath, filename), content);
  }
}
