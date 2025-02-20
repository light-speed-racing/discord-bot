import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class SpencerSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('skeez0414'), new Likelihood(3))
  async respond() {
    return sample((await this.giphy.search('america')).data).images.downsized.url;
  }
}
