import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MemberIsPatreon } from 'src/guard/member-is-patreon.guard';
import sample from 'lodash.sample';

@Injectable()
export class PatreonSaysAnythingEvent {
  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser, MemberIsPatreon, new Likelihood(2))
  async onMessage(message: Message): Promise<void> {
    const messages = [
      `We love you ${message.member} ❤️🩷🩵💚🧡💙🤍💛💓💞💝 <#974936858981187634>`,
      `${message.member} is a patreon and can say anything! <#974936858981187634>`,
      `Without your support, I wouldn't be here. Thank you, ${message.member}! <#974936858981187634>`,
      `I'm so grateful for your support, ${message.member}! <#974936858981187634>`,
      `${message.author} is a Patreon. Be like ${message.author}! <#974936858981187634>`,
      `€2 is nothing for ${message.author}, but it means a lot to us! <#974936858981187634>`,
    ];

    await message.reply(sample(messages));
  }
}
