import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { UserSaidRaveEvent } from './user-said-rave.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [UserSaidRaveEvent],
})
export class GiphyModule {}
