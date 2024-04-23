import { Module } from '@nestjs/common';
import { ChristianMullerSaidEvent } from './christian-muller-said.event';
import { AnyoneSaidRaveEvent } from './anyone-said-rave.event';
import { SpencerSaidEvent } from './spencer-said.event';
import { AnyoneSaysAnythingEvent } from './anyone-says-anything.event';
import { OssiSaidEvent } from './ossi-said.event';
import { EeekSaidEvent } from './eeek-said.event';
import { AnyoneSaidHowDareYouEvent } from './anyone-said-how-dare-you.event';
import { AyrtonSaidEvent } from './ayrton-said.event';
import { PatreonSaysAnythingEvent } from './patreon-says-anything.event';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [
    EeekSaidEvent,
    ChristianMullerSaidEvent,
    AnyoneSaidRaveEvent,
    SpencerSaidEvent,
    OssiSaidEvent,
    AyrtonSaidEvent,
    AnyoneSaysAnythingEvent,
    AnyoneSaidHowDareYouEvent,
    PatreonSaysAnythingEvent,
  ],
})
export class UserSaidModule {}
