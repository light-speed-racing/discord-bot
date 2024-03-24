import { Module } from '@nestjs/common';
import { ChristianMullerSaidEvent } from './christian-muller-said.event';
import { AnyoneSaidRaveEvent } from './anyone-said-rave.event';
import { GiphyModule } from 'src/giphy/giphy.module';
import { SpencerSaidEvent } from './spencer-said.event';
import { AnyoneSaysAnythingEvent } from './anyone-says-anything.event';
import { OssiSaidEvent } from './ossi-said.event';
import { EeekSaidEvent } from './eeek-said.event';
import { AnyoneSaidHowDareYouEvent } from './anyone-said-how-dare-you.event';
import { AyrtonSaidEvent } from './ayrton-said.event';

@Module({
  imports: [GiphyModule],
  providers: [
    EeekSaidEvent,
    ChristianMullerSaidEvent,
    AnyoneSaidRaveEvent,
    SpencerSaidEvent,
    OssiSaidEvent,
    AyrtonSaidEvent,
    AnyoneSaysAnythingEvent,
    AnyoneSaidHowDareYouEvent,
  ],
})
export class UserSaidModule {}
