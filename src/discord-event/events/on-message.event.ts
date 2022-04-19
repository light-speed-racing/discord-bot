import { On, UseGuards } from '@discord-nestjs/core';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message, MessageEmbed } from 'discord.js';
import { UserSaidGuard } from 'src/guards/user-said.guard';
import sample from 'lodash.sample';

@Injectable()
export class OnMessageEvent {
  private readonly logger = new Logger(OnMessageEvent.name);
  private readonly giphy: GiphyFetch;

  constructor(private readonly config: ConfigService) {
    this.giphy = new GiphyFetch(config.get('apiKeys').giphy);
  }

  @On('messageCreate')
  @UseGuards(new UserSaidGuard('raving', 'rave'))
  async main({ author, channel }: Message) {
    this.logger.debug(`${author} is raving!`);

    const { data } = await this.giphy.search('raving');
    const random = sample(data);

    return channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(`I'm raving too`)
          .setDescription(`We are all raving with you ${author}!`)
          .setImage(random.images.original.url),
      ],
    });
  }
}
