import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class OnMessageEvent {
  @On('messageCreate')
  @UseGuards(new Likelihood(3), new MessageSendByUsername('siakoz'))
  respond(message: Message) {
    return sample([
      `Hur vågar du ${message.author}?!?`,
      `Kan jag få lite mer Carlsberg, tack ${message.author}?!?`,
      `Tjennar ${message.author}`,
      'https://www.youtube.com/watch?v=WRuf6iI1C5Y',
      '🍻 Helan går. Sjung hopp faderallan lallan lej 🍻',
    ]);
  }
}
