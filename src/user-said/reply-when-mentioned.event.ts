import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { IAmMentionedOrRepliedTo } from 'src/guard/i-am-mentioned-or-replied-to.guard';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class ReplyWhenMentionedEvent {
  constructor(private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser, IAmMentionedOrRepliedTo)
  async respond(message: Message) {
    return await this.chatgpt.reply(message.content);
  }
}
