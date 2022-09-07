import {
  Catch,
  DiscordArgumentMetadata,
  DiscordExceptionFilter,
  InjectDiscordClient,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import { Client, MessageEmbed } from 'discord.js';
import { BaseConfig } from '../config/base.config';
import { Config } from '../config/config.types';

@Catch(ValidationError)
export class CommandValidationFilter implements DiscordExceptionFilter {
  constructor(
    @InjectDiscordClient() private readonly client: Client,
    private readonly config: ConfigService<Config>,
  ) {}

  async catch(
    exceptionList: ValidationError[],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    const { logo } = this.config.get<BaseConfig>('base');
    const [interaction] = metadata.eventArgs;

    const embeds = exceptionList.map((exception) =>
      new MessageEmbed()
        .setColor('RED')
        .addFields(
          Object.values(exception.constraints).map((value) => ({
            name: exception.property,
            value,
          })),
        )
        .setThumbnail(logo)
        .setTimestamp()
        .setAuthor({
          name: this.client.user.tag,
          iconURL: logo,
        })
        .setFooter({
          text: this.client.user.tag,
          iconURL: logo,
        }),
    );

    if (interaction.isCommand()) await interaction.reply({ embeds });
  }
}
