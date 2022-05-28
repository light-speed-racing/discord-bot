import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { ServerCommand } from './server.command';
import { ServerService } from './server.service';
import { GithubService } from 'src/common/github.service';
import { FtpService } from 'src/common/ftp.service';
import { EntryListSubCommand } from './subcommands/entrylist.subcommand';
import { SyncSubCommand } from './subcommands/sync.subcommand';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    ServerService,
    GithubService,
    FtpService,
    ServerCommand,
    SyncSubCommand,
    EntryListSubCommand,
  ],
})
export class ServerModule {}
