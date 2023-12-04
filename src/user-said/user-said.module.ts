import { Module } from '@nestjs/common';
import { SiakozSaidEvent } from './siakoz-said.event';
import { ChristianMullerSaidEvent } from './christian-muller-said.event';
import { AnyoneSaidRaveEvent } from './anyone-said-rave.event';
import { GiphyModule } from 'src/giphy/giphy.module';
import { SpencerOrAndrewSaidEvent } from './spencer-or-andrew-said.event';

@Module({
  imports: [GiphyModule],
  providers: [SiakozSaidEvent, ChristianMullerSaidEvent, AnyoneSaidRaveEvent, SpencerOrAndrewSaidEvent],
})
export class UserSaidModule {}
