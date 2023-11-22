import { Module } from '@nestjs/common';
import { OnMessageEvent } from './on-message.event';

@Module({
  providers: [OnMessageEvent],
})
export class DiscordEventsModule {}
