import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class OssiSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('ojk41'), new Likelihood(3))
  async onMessage(message: Message): Promise<string> {
    return sample([
      sample((await this.giphy.search('findland')).data).images.downsized.url,
      sample((await this.giphy.search('snow')).data).images.downsized.url,
      sample((await this.giphy.search('blonde boy')).data).images.downsized.url,
      sample((await this.giphy.search('ossi')).data).images.downsized.url,
      sample((await this.giphy.search('greta')).data).images.downsized.url,
      await this.chatgpt.reply(message),
      await this.chatgpt.insult('Make a haiku about snow and how much it lights up in finland', message.author.id),
      await this.chatgpt.insult('Tell me a very short oneline story about how blonde Ossi is', message.author.id),
    ]);
  }
}
