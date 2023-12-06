import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';

@Injectable()
export class AnyoneSaysAnythingEvent {
  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser, new Likelihood(0.0001))
  async onMessage(message: Message): Promise<void> {
    const messages = [
      'I am go mad at you! How dare you! Go hug a tree and give me proof or I will ban you! #furyofgreta',
      'I will ban you!!',
      `How dare you say my name ${message.author}?!`,
      `I own 100 private jets`,
    ];
    await message.reply(sample(messages));
  }
}
