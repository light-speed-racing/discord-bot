import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class FatPicassoSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('kjgeorge90'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      sample((await this.giphy.search('king')).data).images.downsized.url,
      await this.chatgpt.insult(
        'His name is Kris and he is the fastest of them all (in division 800)',
        message.author.id,
      ),
      await this.chatgpt.reply(message.content),
    ]);
  }
}
