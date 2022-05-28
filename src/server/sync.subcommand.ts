import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Formatters } from 'discord.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FtpService } from 'src/common/ftp.service';
import { GithubService, ServerConfigFiles } from 'src/common/github.service';
import { Config } from 'src/config/config.types';
import { ServerSetupConfig } from 'src/config/server-setup.config';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { RoleGuard } from 'src/guards/role.guard';
import { Championships } from './championships.enum';
import { ServerConfigDto } from './server-config.dto';
import { ServerService } from './server.service';

@SubCommand({
  name: 'sync',
  description: 'Sync the configuration for a championship',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class SyncSubCommand
  implements DiscordTransformedCommand<ServerConfigDto>
{
  private readonly logger: Logger = new Logger(SyncSubCommand.name);

  private readonly serverConfigTempPath = join(
    __dirname,
    '..',
    '..',
    '__server-config__',
  );

  constructor(
    private readonly service: ServerService,
    private readonly github: GithubService,
    private readonly config: ConfigService<Config>,
    private readonly ftp: FtpService,
  ) {}

  @UseGuards(new RoleGuard('host', 'moderator', 'steward'))
  async handler(@Payload() dto: ServerConfigDto) {
    try {
      const name =
        Object.keys(Championships)[
          Object.values(Championships).indexOf(dto.championship)
        ];
      const serverFiles = await this.fetchServerConfigOnGithub(dto);

      this.storeTempFiles({
        'settings.json': serverFiles['settings.json'],
        'assistRules.json': serverFiles['assistRules.json'],
        'event.json': serverFiles['event.json'],
        'eventRules.json': serverFiles['eventRules.json'],
        'entryList.json': await this.fetchEntryList(dto),
      });

      await this.ftp.connectAndUploadFrom(this.serverConfigTempPath);

      return `Configuration for ${Formatters.bold(
        name,
      )} was updated. You need to restart the server manually to apply these configurations`;
    } catch (error) {
      return error.message;
    }
  }

  private storeTempFiles(content: Record<string, Record<string, unknown>>) {
    this.logger.debug(`Storing files`);
    if (!existsSync(this.serverConfigTempPath)) {
      this.logger.debug(`Creating directory`);
      mkdirSync(this.serverConfigTempPath);
    }

    for (const fileName in content) {
      this.logger.debug(`Writing ${fileName}`);
      writeFileSync(
        join(this.serverConfigTempPath, fileName),
        JSON.stringify(content[fileName], null, 2),
      );
    }
  }

  private adminPassword({ adminPassword }: Partial<ServerConfigDto>) {
    const { defaultAdminPassword } =
      this.config.get<ServerSetupConfig>('server-setup');

    return adminPassword ?? defaultAdminPassword;
  }

  private async fetchEntryList({
    championship,
    forceentrylist,
  }: ServerConfigDto) {
    this.logger.debug(`Fetching entrylist from SimGrid for ${championship}`);
    return await this.service.entryListFor(championship, forceentrylist);
  }

  private async fetchServerConfigOnGithub({
    championship,
    adminPassword,
  }: ServerConfigDto) {
    this.logger.debug(`Fetching championship files for ${championship}`);
    const serverFiles = await this.github.fetchChampionshipConfig(championship);

    return {
      ...serverFiles,
      ...this.replace(
        'settings.json',
        'adminPassword',
        this.adminPassword({ adminPassword }),
        serverFiles,
      ),
    };
  }

  private replace(
    fileName: string,
    key: string,
    value: unknown,
    serverFiles: ServerConfigFiles,
  ) {
    this.logger.debug(`Replacing ${key}: ${value} in ${fileName}`);
    return {
      ...serverFiles,
      [fileName]: {
        ...serverFiles[fileName],
        [key]: value,
      },
    };
  }
}
