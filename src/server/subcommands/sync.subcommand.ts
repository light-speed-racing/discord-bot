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
import { Championships } from '../enum/championships.enum';
import { SyncDto } from '../dto/server-sync.dto';
import { ServerService } from '../server.service';

@SubCommand({
  name: 'sync',
  description: 'Sync the configuration for a championship',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class SyncSubCommand implements DiscordTransformedCommand<SyncDto> {
  private readonly logger: Logger = new Logger(SyncSubCommand.name);

  constructor(
    private readonly service: ServerService,
    private readonly github: GithubService,
    private readonly config: ConfigService<Config>,
    private readonly ftp: FtpService,
  ) {}

  @UseGuards(new RoleGuard('admin', 'host', 'moderator', 'steward'))
  async handler(@Payload() dto: SyncDto) {
    try {
      const name =
        Object.keys(Championships)[
          Object.values(Championships).indexOf(dto.championship)
        ];
      const serverFiles = await this.fetchServerConfigOnGithub(dto);

      this.service.storeFile('settings.json', serverFiles['settings.json']);
      this.service.storeFile(
        'assistRules.json',
        serverFiles['assistRules.json'],
      );
      this.service.storeFile('event.json', serverFiles['event.json']);
      this.service.storeFile('eventRules.json', serverFiles['eventRules.json']);
      await this.service.entryListFor(dto.championship, dto.forceentrylist);

      await this.ftp.uploadAllFilesFrom(ServerService.serverConfigTempPath);

      return `Configuration for ${Formatters.bold(
        name,
      )} was updated. You need to restart the server manually to apply these configurations`;
    } catch (error) {
      return error.message;
    }
  }

  private adminPassword({ adminPassword }: Partial<SyncDto>) {
    const { defaultAdminPassword } =
      this.config.get<ServerSetupConfig>('server-setup');

    return adminPassword ?? defaultAdminPassword;
  }

  private async fetchServerConfigOnGithub({
    championship,
    adminPassword,
  }: SyncDto) {
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
