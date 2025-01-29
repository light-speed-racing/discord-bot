import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class UseChatGptToReplyEvent {
  constructor(private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(
    new MessageSendByUsername(
      'costa_jr07',
      'k10589',
      'arcee___',
      'razout',
      'danielwelsh',
      'redspacecase',
      'callum.0042',
      'whitetip13',
      'bjarni_olsen',
      'ojk41',
      'kspace5oy',
      'zwerg_',
      'f1charged',
      'shoebop',
      'rretrucker',
      'rcinnamond05',
      'eeekdk',
      'redlinezak',
      'mort4188',
      'laura_nyaaa',
      'ryan9646',
      'traumag0tch1',
      'manois',
      'skeez0414',
      'absolutlol',
      '_loman',
      'jensenracer',
      'dmuub',
      'dan.2.da.g',
      'kjgeorge90',
      'phillzskillz',
    ),
    new Likelihood(5),
  )
  async onMessage(message: Message): Promise<string> {
    return sample([
      await this.chatgpt.insult('Ask the user why they are doing simracing', message.author.id),
      await this.chatgpt.insult(`Tell me a shot story about ${message.author.displayName}`, message.author.id),
      await this.chatgpt.reply(message.content),
      await this.chatgpt.reply(message.content),
      await this.chatgpt.reply(message.content),
      await this.chatgpt.reply(message.content),
    ]);
  }
}
