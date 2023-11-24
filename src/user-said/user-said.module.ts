import { Module } from '@nestjs/common';
import { SiakozSaidEvent } from './siakoz-said.event';
import { ChristianMullerSaidEvent } from './christian-muller-said.event';
import { AnyoneSaidRaveEvent } from './anyone-said-rave.event';
import { GiphyModule } from 'src/giphy/giphy.module';

@Module({
  imports: [GiphyModule],
  providers: [SiakozSaidEvent, ChristianMullerSaidEvent, AnyoneSaidRaveEvent],
})
export class UserSaidModule {}
