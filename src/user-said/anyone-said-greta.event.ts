import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { MessageContains } from 'src/guard/message-contains.guard';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';

@Injectable()
export class AnyoneSaidRaveEvent {
  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser, new Likelihood(25), new MessageContains('Greta', 'Thunberg'))
  async onMessage(message: Message): Promise<void> {
    const messages = [
      `How dare you say my name ${message.author}?!`,
      `I own 100 private jets`,
      'When I travle I only travle by boat. All my subjects takes a plane though',
    ];
    await message.reply(sample(messages));
  }
}
