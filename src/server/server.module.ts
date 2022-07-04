import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { SyncSubCommand } from './sync.subcommand';
import { ServerCommand } from './server.command';

import { GithubService } from 'src/common/github.service';
import { FtpService } from 'src/common/ftp.service';
import { SimgridService } from 'src/common/simgrid.service';
import { EntryListSubCommand } from './entrylist.subcommand';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    SimgridService,
    GithubService,
    FtpService,
    ServerCommand,
    SyncSubCommand,
    EntryListSubCommand,
  ],
})
export class ServerModule {}
