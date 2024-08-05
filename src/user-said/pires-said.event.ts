import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class PiresSaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('manois'), new Likelihood(3))
  async respond() {
    return sample([sample((await this.giphy.search('bacalhau')).data).images.downsized.url]);
  }
}
