import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class OssiSaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('ojk41'), new Likelihood(3))
  async onMessage(): Promise<string> {
    return sample([
      sample((await this.giphy.search('findland')).data).images.downsized.url,
      sample((await this.giphy.search('snow')).data).images.downsized.url,
      sample((await this.giphy.search('blonde boy')).data).images.downsized.url,
      sample((await this.giphy.search('ossi')).data).images.downsized.url,
      sample((await this.giphy.search('greta')).data).images.downsized.url,
      sample((await this.giphy.search('hard r')).data).images.downsized.url,
    ]);
  }
}
