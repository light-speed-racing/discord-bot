import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class AyrtonSaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('ayrton85'), new Likelihood(3))
  async onMessage(message: Message): Promise<string> {
    return sample([
      sample((await this.giphy.search('ayrton')).data).images.downsized.url,
      sample((await this.giphy.search('greta lover')).data).images.downsized.url,
      sample((await this.giphy.search('so young')).data).images.downsized.url,
      sample((await this.giphy.search('who are even are you')).data).images.downsized.url,
      sample((await this.giphy.search('greta')).data).images.downsized.url,
      sample((await this.giphy.search('nederlands')).data).images.downsized.url,
      sample((await this.giphy.search('holland')).data).images.downsized.url,
      sample((await this.giphy.search('belgium')).data).images.downsized.url,
      sample((await this.giphy.search('love belgium')).data).images.downsized.url,
      sample((await this.giphy.search('mario kart')).data).images.downsized.url,
      sample((await this.giphy.search('slow')).data).images.downsized.url,
      sample((await this.giphy.search('baby boy')).data).images.downsized.url,
      `Wait, ${message.author}.... You are in love with me?!? Wow...`,
    ]);
  }
}
