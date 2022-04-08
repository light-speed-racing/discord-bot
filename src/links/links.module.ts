import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { LinksCommand } from './links.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [LinksCommand],
})
export class LinksModule {}
