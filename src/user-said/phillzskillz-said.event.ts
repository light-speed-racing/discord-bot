import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class PhillzskillzSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('phillzskillz'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      sample((await this.giphy.search('')).data).images.downsized.url,
      await this.chatgpt.insult('Phill is the F1 champion', message.author.id),
      await this.chatgpt.insult(
        'Tell me a short story about why Phills discord username is phillskillz',
        message.author.id,
      ),
      await this.chatgpt.reply(message.content),
    ]);
  }
}
