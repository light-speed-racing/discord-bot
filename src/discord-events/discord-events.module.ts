import { Module } from '@nestjs/common';
import { OnMessageBySiakoz } from './on-message-by-siakoz.event';
import { OnMessageByMuller } from './on-message-by-christian-muller.event';

@Module({
  providers: [OnMessageBySiakoz, OnMessageByMuller],
})
export class DiscordEventsModule {}
