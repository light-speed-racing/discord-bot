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
      'https://www.politico.eu/cdn-cgi/image/width=1024,quality=80,onerror=redirect,format=auto/wp-content/uploads/2023/10/17/GettyImages-1730100756-scaled.jpg',
      'https://www.aljazeera.com/wp-content/uploads/2021/02/2021-02-04T120904Z_548500413_RC2OLL9LE1AY_RTRMADP_3_INDIA-FARMS-PROTESTS.jpg?resize=770%2C513&quality=80',
      'https://www.reuters.com/resizer/agn4hHMbOC1mwCcd2UQZm5Wknsg=/960x0/filters:quality(80)/cloudfront-us-east-2.images.arcpublishing.com/reuters/TXEN5A2NR5OJHIDXRBOIANPLQM.jpg',
    ];
    await message.reply(sample(messages));
  }
}
