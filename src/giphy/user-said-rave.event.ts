import { On } from '@discord-nestjs/core';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { RootConfig } from 'src/config/config';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { MessageContent } from 'src/guard/message-content.guard';
import sample from 'lodash.sample';
import { EmbedBuilder } from '@discordjs/builders';

@Injectable()
export class UserSaidRaveEvent {
  private readonly giphy: GiphyFetch;

  constructor(private readonly config: RootConfig) {
    this.giphy = new GiphyFetch(config.giphy.apiKey);
  }

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
