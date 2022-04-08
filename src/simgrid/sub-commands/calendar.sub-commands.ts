import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { InteractionReplyOptions, MessageEmbed } from 'discord.js';

@SubCommand({
  name: 'calendar',
  description: 'Link to our simgrid event calendar',
})
export class CalendarSubCommand implements DiscordCommand {
  constructor(private readonly config: ConfigService) {}

  handler(): InteractionReplyOptions {
    return {
      embeds: [
        new MessageEmbed().addField(
          'The Light Speed Racing event calendar',
          this.config.get<string>('SIMGRID_CALENDAR_URL'),
        ),
      ],
    };
  }
}
