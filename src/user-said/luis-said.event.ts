import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class LuisSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('whitetip13'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      sample((await this.giphy.search('coach')).data).images.downsized.url,
      await this.chatgpt.reply(message.content),
      await this.chatgpt.insult(
        'Luis comes from Germany and he does some super good coaching sessions',
        message.author.id,
      ),
      await this.chatgpt.insult(
        'Luis is the fastest simracer in the world, he is so fast that he can lap the entire field in 1 lap',
        message.author.id,
      ),
    ]);
  }
}
