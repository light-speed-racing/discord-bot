import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class AyrtonSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) { }

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('ayrton85'), new Likelihood(3))
  async onMessage(message: Message): Promise<string> {
    return sample([
      sample((await this.giphy.search('ayrton')).data).images.downsized.url,
      sample((await this.giphy.search('nederlands')).data).images.downsized.url,
      sample((await this.giphy.search('love belgium')).data).images.downsized.url,
      `Wait, ${message.author}.... You are in love with me?!? Wow...`,
      await this.chatgpt.insult("Ayrton's dad named him after Ayrton Senna", message.author.id),
      await this.chatgpt.reply(message),
    ]);
  }
}
