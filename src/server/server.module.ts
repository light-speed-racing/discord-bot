import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { SetupSubCommand } from './setup.subcommand';
import { ServerCommand } from './server.command';
import { ServerService } from './server.service';
import { GithubService } from 'src/common/github.service';
import { FtpService } from 'src/common/ftp.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    ServerService,
    GithubService,
    FtpService,
    ServerCommand,
    SetupSubCommand,
  ],
})
export class ServerModule {}
