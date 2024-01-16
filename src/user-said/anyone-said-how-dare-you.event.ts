import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { MessageContains } from 'src/guard/message-contains.guard';
import sample from 'lodash.sample';
import { GiphyService } from 'src/giphy/giphy.service';

@Injectable()
export class AnyoneSaidHowDareYouEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser)
  @UseGuards(new MessageContains('how dare you'))
  async onMessage(message: Message): Promise<void> {
    const { data } = await this.giphy.search('how dare you');
    const random = sample(data);

    await message.reply(random.images.downsized.url);
  }
}
