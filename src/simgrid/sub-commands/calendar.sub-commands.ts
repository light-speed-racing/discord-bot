import {
  DiscordCommand,
  InjectDiscordClient,
  SubCommand,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Client, InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { BaseConfig } from 'src/config/base.config';
import { Config } from 'src/config/config.types';
import { SimgridConfig } from 'src/config/simgrid.config';

@SubCommand({
  name: 'calendar',
  description: 'Link to our simgrid event calendar',
})
export class CalendarSubCommand implements DiscordCommand {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  handler(): InteractionReplyOptions {
    const { logo } = this.config.get<BaseConfig>('base');

    return {
      embeds: [
        new MessageEmbed()
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
          .addField(
            'The Light Speed Racing event calendar',
            this.config.get<SimgridConfig>('simgrid').calendar,
          ),
      ],
    };
  }
}
