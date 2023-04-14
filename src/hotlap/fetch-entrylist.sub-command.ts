import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ActionRowBuilder, StringSelectMenuInteraction } from 'discord.js';
import { HotlapService } from './hotlap.service';
import { SelectMenuBuilder } from '@discordjs/builders';

@SubCommand({
  name: 'fetch-entrylist',
  description: 'Get entrylsit for a hotlap',
})
export class FetchEntrylistSubcommand {
  constructor(private readonly service: HotlapService) {}

  private readonly logger = new Logger(FetchEntrylistSubcommand.name);

  @Handler()
  async register(interaction: StringSelectMenuInteraction): Promise<void> {
    const entities = await this.service.all();

    const dropdown = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder().setCustomId('select').addOptions(
        ...entities
          .filter((hotlap) => !!hotlap.track)
          .map((server) => ({
            label: server.title,
            value: server.id,
            description: server.track,
            data: server,
          })),
      ),
    );

    const reply = await interaction.reply({ ephemeral: true, components: [dropdown] });
    const collector = reply.createMessageComponentCollector();
    collector.on('collect', (collected) => {
      console.log(collected);
    });

    // collector.checkEnd();
    // console.log(collector.toJSON());
  }
}

// filter(interaction: ButtonInteraction): boolean {
//   return this.causeInteraction.id === interaction.message.interaction.id;
// }
