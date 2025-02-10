import { Module } from '@nestjs/common';
import { ChristianMullerSaidEvent } from './christian-muller-said.event';
import { AnyoneSaidRaveEvent } from './anyone-said-rave.event';
import { SpencerSaidEvent } from './spencer-said.event';
import { OssiSaidEvent } from './ossi-said.event';
import { EeekSaidEvent } from './eeek-said.event';
import { AyrtonSaidEvent } from './ayrton-said.event';
import { PatreonSaysAnythingEvent } from './patreon-says-anything.event';
import { CommonModule } from 'src/common/common.module';
import { TonySaidEvent } from './tony-said.event';
import { OpenaiModule } from 'src/openai/openai.module';
import { LuisSaidEvent } from './luis-said.event';
import { UseChatGptToReplyEvent } from './use-chatgpt-to-reply.event';
import { ReplyWhenMentionedEvent } from './reply-when-mentioned.event';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [CommonModule, OpenaiModule, DiscordModule.forFeature()],
  providers: [
    ReplyWhenMentionedEvent,
    EeekSaidEvent,
    ChristianMullerSaidEvent,
    AnyoneSaidRaveEvent,
    SpencerSaidEvent,
    OssiSaidEvent,
    AyrtonSaidEvent,
    PatreonSaysAnythingEvent,
    TonySaidEvent,
    LuisSaidEvent,
    UseChatGptToReplyEvent,
  ],
})
export class UserSaidModule {}
