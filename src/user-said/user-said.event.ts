import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import { MessageContains } from 'src/guard/message-contains.guard';
import sample from 'lodash.sample';
import { EmbedBuilder } from '@discordjs/builders';
import { GiphyService } from 'src/common/giphy.service';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class UserSaidEvent {
  constructor(private readonly giphy: GiphyService, private readonly chatgpt: OpenaiService) {}

  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser)
  @UseGuards(new MessageContains('rave', 'raving'))
  async onMessage(message: Message): Promise<void> {
    const { data } = await this.giphy.search('raving');
    const random = sample(data);

    await message.reply({
      embeds: [
        new EmbedBuilder({
          description: `Lets raaaaave ${message.author}!`,
          image: { url: random.images.downsized.url },
        }),
      ],
    });
  }

  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser)
  @UseGuards(new MessageContains('snetterton', 'netterton', 'snettertwn', 'etterton'))
  async onSnetterton(message: Message): Promise<string> {
    return sample([
      await this.chatgpt
        .initialPrompt({ content: 'Listen... We do not talk about snetterton', role: 'system' })
        .reply(message),
      await this.chatgpt.insult(
        'Tell the user that you do not talk about Snetterton. Uou do not talk about Snetterton.... You will never talk about Snetterton...! How dare you!',
        message,
      ),
    ]);
  }
}
