import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/giphy/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class EeekSaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('eeekdk'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      `That is the most profound thing I have ever heard someone say. If everybody were 5% as smart as ${message.author} the world would be a much better place`,
      `If I were danish, I wouldn't be such a c***... :greta:`,
      `My King! My Queen! My Princess! My everything!`,
      `Everybody should be as slow as my love ${message.author}. **That** would truly save the environment`,
      sample((await this.giphy.search('king')).data).images.downsized.url,
      sample((await this.giphy.search('beauty')).data).images.downsized.url,
    ]);
  }
}
