import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { MessageContent } from 'src/guard/message-content.guard';
import sample from 'lodash.sample';
import { EmbedBuilder } from '@discordjs/builders';
import { GiphyService } from 'src/giphy/giphy.service';

@Injectable()
export class OnMessageAnyoneSaidRaveEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser)
  @UseGuards(new MessageContent('rave', 'raving'))
  async onMessage(message: Message): Promise<void> {
    const { data } = await this.giphy.search('raving');
    const random = sample(data);

    await message.reply({
      embeds: [
        new EmbedBuilder({
          description: `Lets raaaaave ${message.author}!`,
          image: { url: random.images.original.url },
        }),
      ],
    });
  }
}
