import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

@Module({
  imports: [DiscordModule.forFeature()],
})
export class TaskModule {}
