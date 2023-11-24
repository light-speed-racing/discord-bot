import { Module } from '@nestjs/common';
import { OnMessageBySiakoz } from './on-message-by-siakoz.event';
import { OnMessageByMuller } from './on-message-by-christian-muller.event';
import { OnMessageAnyoneSaidRaveEvent } from './on-message-anyone-said-rave.event';
import { GiphyModule } from 'src/giphy/giphy.module';

@Module({
  imports: [GiphyModule],
  providers: [OnMessageBySiakoz, OnMessageByMuller, OnMessageAnyoneSaidRaveEvent],
})
export class DiscordEventsModule {}
