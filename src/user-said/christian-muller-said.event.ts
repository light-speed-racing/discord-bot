import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class ChristianMullerSaidEvent {
  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('hypn0tik4735'), new Likelihood(5))
  respond(message: Message) {
    return sample([
      `Five championships... And then you give up.. Pfft. How dare you?!? You are not the ${message.author} you use to be`,
      `It's a Bird... It's a Plane... No...! It's ${message.author}`,
      `Guys! Is that ${message.author}? The many time champion...?!?`,
      `Meet the "hall of famer": ${message.author}`,
    ]);
  }
}
