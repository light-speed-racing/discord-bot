import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  InjectDiscordClient,
  Payload,
  SubCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Client, InteractionReplyOptions, MessageEmbed } from 'discord.js';
import moment from 'moment-timezone';
import { CommandValidationFilter } from 'src/filters/command-validation.filter';
import { TimezoneDto, Timezones } from './timezone.dto';

@SubCommand({
  name: 'timezone',
  description: 'What is the server time',
})
@UsePipes(TransformPipe)
@UseFilters(CommandValidationFilter)
export class TimezoneSubCommand
  implements DiscordTransformedCommand<TimezoneDto>
{
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  handler(@Payload() { tz }: TimezoneDto): InteractionReplyOptions {
    const { logo } = this.config.get('base');

    const theTz = Timezones[tz];
    const embed = new MessageEmbed()
      .setThumbnail(logo)
      .setTimestamp()
      .setAuthor({
        name: this.client.user.tag,
        iconURL: logo,
      })
      .setFooter({
        text: this.client.user.tag,
        iconURL: logo,
      });

    if (!theTz) {
      embed
        .setTitle('You provided a unknown timezone')
        .setDescription('The following timezones is available');

      for (const t in Timezones) {
        embed.addField(t, Timezones[t]);
      }

      return {
        embeds: [embed],
      };
    }

    return {
      embeds: [embed.addField(tz, moment.tz(theTz).format('LLLL'))],
    };
  }
}
