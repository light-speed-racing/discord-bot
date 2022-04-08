import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';

@SubCommand({
  name: 'profile',
  description: 'Link to our simgrid profile',
})
export class ProfileSubCommand implements DiscordCommand {
  constructor(private readonly config: ConfigService) {}

  handler(): InteractionReplyOptions {
    return {
      embeds: [
        new MessageEmbed().addField(
          'The Light Speed Racing profile on simgrid',
          this.config.get<string>('SG_PROFILE_URL'),
        ),
      ],
    };
  }
}
