import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class SpencerOrAndrewSaidEvent {
  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('skeez0414', 'shoebop'), new Likelihood(2))
  respond() {
    return sample([
      `https://oyster.ignimgs.com/wordpress/stg.ign.com/2015/07/Z11P8R5FSd0X.gif?fit=bounds&width=1280&height=720`,
      'https://oyster.ignimgs.com/wordpress/stg.ign.com/2015/07/7175419Hh4tnSB7.gif?fit=bounds&width=1280&height=720',
      'https://media.tenor.com/xFYrDGPvOTIAAAAC/america-flag.gif',
      'https://gifdb.com/images/high/american-eagle-crying-merica-murica-9m0dea7inu2s2q1u.webp',
      'https://gifdb.com/images/high/funny-guy-hip-thrust-merica-murica-tkbiyw8jyyinc1vd.webp',
      'https://gifdb.com/images/high/american-eagles-holding-guns-merica-murica-osv1slv60wuzh009.webp',
      'https://gifdb.com/images/high/shoulder-shake-merica-murica-iq3473jnbuwrdzqk.webp',
      'https://gifdb.com/images/high/merica-murica-in-one-picture-lqeqkfmk8y7zc1qu.webp',
      'https://gifdb.com/images/high/epic-fail-grocery-shopping-merica-murica-2agjyopnwarb88md.webp',
      'https://www.youtube.com/watch?v=-S_8TjQcpMo',
      'https://gifdb.com/images/high/eagle-wearing-merica-murica-bandana-8sq1f5x50e7fmg4s.webp',
      'https://imgflip.com/gif/7zx9db',
    ]);
  }
}
