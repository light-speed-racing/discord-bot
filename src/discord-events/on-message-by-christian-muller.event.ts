import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class OnMessageByMuller {
  @On('messageCreate')
  @UseGuards(new Likelihood(3), new MessageSendByUsername('hypn0tik4735'))
  respond(message: Message) {
    return sample([
      `It's a Bird... It's a Plane... No...! It's ${message.author}`,
      `Guys! Is that ${message.author}? The many time champion...?!?`,
      `Meet the "hall of famer": ${message.author}`,
    ]);
  }
}
