import {
  DiscordCommand,
  InjectDiscordClient,
  SubCommand,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Client, InteractionReplyOptions, MessageEmbed } from 'discord.js';
import { BaseConfig, Config, SimgridConfig } from 'src/config/config.types';

@SubCommand({
  name: 'profile',
  description: 'Link to our simgrid profile',
})
export class ProfileSubCommand implements DiscordCommand {
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
            'The Light Speed Racing profile on simgrid',
            this.config.get<SimgridConfig>('simgrid').profile,
          ),
      ],
    };
  }
}
