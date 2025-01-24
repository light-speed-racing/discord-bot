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
import { TonySaidEvent } from './tony-said.event';
import { PiresSaidEvent } from './pires-said.event';
import { OpenaiModule } from 'src/openai/openai.module';
import { PhillzskillzSaidEvent } from './phillzskillz-said.event';
import { Dan2DaGSaidEvent } from './Dan2Dag-said.event';
import { FatPicassoSaidEvent } from './fatpicasso-said.event';
import { LuisSaidEvent } from './luis-said.event';

@Module({
  imports: [CommonModule, OpenaiModule],
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
    TonySaidEvent,
    PiresSaidEvent,
    PhillzskillzSaidEvent,
    Dan2DaGSaidEvent,
    FatPicassoSaidEvent,
    LuisSaidEvent,
  ],
})
export class UserSaidModule {}
