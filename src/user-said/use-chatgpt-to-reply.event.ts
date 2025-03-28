import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
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
      'bjarni_olsen',
      'kspace5oy',
      'zwerg_',
      'f1charged',
      'shoebop',
      'rretrucker',
      'rcinnamond05',
      'redlinezak',
      'mort4188',
      'laura_nyaaa',
      'ryan9646',
      'manois',
      'absolutlol',
      '_loman',
      'jensenracer',
      'dmuub',
      'dan.2.da.g',
      'kjgeorge90',
      'phillzskillz',
    ),
    new Likelihood(3),
  )
  async onMessage(message: Message): Promise<string> {
    return await this.chatgpt.reply(message);
  }
}
