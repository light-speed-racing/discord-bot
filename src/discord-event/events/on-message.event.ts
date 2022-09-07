import { InjectDiscordClient, On, UseGuards } from '@discord-nestjs/core';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Message, MessageEmbed } from 'discord.js';
import { UserSaidGuard } from '../../guards/user-said.guard';
import sample from 'lodash.sample';
import { Config } from '../../config/config.types';
import { ApiKeysConfig } from '../../config/apiKeys.config';
import { BaseConfig } from '../../config/base.config';

@Injectable()
export class OnMessageEvent {
  private readonly logger = new Logger(OnMessageEvent.name);
  private readonly giphy: GiphyFetch;

  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {
    this.giphy = new GiphyFetch(
      this.config.get<ApiKeysConfig>('apiKeys').giphy,
    );
  }

  @On('messageCreate')
  @UseGuards(new UserSaidGuard('raving', 'rave'))
  async raving({ author, channel }: Message) {
    this.logger.debug(`${author} is raving!`);

    const { data } = await this.giphy.search('raving');
    const random = sample(data);
    const { logo } = this.config.get<BaseConfig>('base');

    return channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(`I'm raving too`)
          .setDescription(`We are all raving with you ${author}!`)
          .setThumbnail(logo)
          .setTimestamp()
          .setAuthor({
            name: this.client.user.tag,
            iconURL: logo,
          })
          .setFooter({
            text: this.client.user.tag,
            iconURL: logo,
          })
          .setImage(random.images.original.url),
      ],
    });
  }
}
