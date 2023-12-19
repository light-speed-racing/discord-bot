import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class SiakozSaidEvent {
  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('siakoz'), new Likelihood(5))
  respond(message: Message) {
    return sample([
      `Hur vågar du ${message.author}?!?`,
      `Kan jag få lite mer Carlsberg, tack ${message.author}?!?`,
      `Tjennar ${message.author}`,
      '🍻 Helan går. Sjung hopp faderallan lallan lej 🍻',
      'https://giphy.com/embed/l46CxJ9ai3N8UrAgE',
      'https://giphy.com/embed/qTFQeTwms3xW8',
    ]);
  }
}
