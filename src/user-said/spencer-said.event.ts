import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class SpencerSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('skeez0414'), new Likelihood(2))
  async respond(message: Message) {
    return sample([
      await this.chatgpt.insult('Tell me how slow Spencer is', message.author.id),
      await this.chatgpt.insult('Spencer is the fastes turtle in a race car?', message.author.id),
      await this.chatgpt.reply(message),
      sample((await this.giphy.search('america')).data).images.downsized.url,
    ]);
  }
}
