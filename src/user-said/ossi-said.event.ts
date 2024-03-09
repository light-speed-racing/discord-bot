import { On } from '@discord-nestjs/core';
import { EmbedBuilder } from '@discordjs/builders';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/giphy/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class OssiSaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('ojk41'), new Likelihood(3))
  async onMessage(message: Message): Promise<void> {
    const { data } = await this.giphy.search('finland');

    const { images } = sample(data);

    await message.reply({
      embeds: [
        new EmbedBuilder({
          image: { url: images.downsized.url },
        }),
      ],
    });
  }
}
