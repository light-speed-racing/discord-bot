import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class Dan2DaGSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('dan.2.da.g'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      await this.chatgpt.insult('Dan is a beautifull man.', message.author.id),
      await this.chatgpt.reply(message.content),
    ]);
  }
}
