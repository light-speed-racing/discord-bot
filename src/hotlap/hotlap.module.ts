import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { HotlapCommand } from './hotlap.command';
import { MakeSubcommand } from './create-server.sub-command';
import { DeleteServerSubcommand } from './delete-server.sub-command';
import { FetchResultsSubcommand } from './update-results.sub-command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [HotlapCommand, MakeSubcommand, DeleteServerSubcommand, FetchResultsSubcommand],
  exports: [],
})
export class HotlapModule {}
