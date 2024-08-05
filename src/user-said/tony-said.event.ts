import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import sample from 'lodash.sample';
import { GiphyService } from 'src/common/giphy.service';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { MessageSendByUsername } from 'src/guard/message-send-by.guard';

@Injectable()
export class TonySaidEvent {
  constructor(private readonly giphy: GiphyService) {}

  @On('messageCreate')
  @UseGuards(new MessageSendByUsername('jamena_'), new Likelihood(3))
  async respond(message: Message) {
    return sample([
      `If ${message.author} spend as much time on his work as he does on his hair, he would be a millionaire by now.... WHAT HAIR?!?`,
      'Pa-pa-pa-pandamonium',
      'https://images-ext-1.discordapp.net/external/EUc724C5ls69yFads2OOjQS67BP71AIEkG_eToADO5k/https/media.tenor.com/p4MNhgEwIGwAAAPo/poggers-fish-lol.mp4',
      sample((await this.giphy.search('burger king')).data).images.downsized.url,
      sample((await this.giphy.search('yelling')).data).images.downsized.url,
      sample((await this.giphy.search('bacalhau')).data).images.downsized.url,
    ]);
  }
}
