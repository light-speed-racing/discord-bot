import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { OnReadyEvent } from './events/on-ready.event';
import { OnUserJoinEvent } from './events/on-user-join.event';
import { OnUserJoinLeave } from './events/on-user-leave.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [OnReadyEvent, OnUserJoinEvent, OnUserJoinLeave],
})
export class BotModule {}
