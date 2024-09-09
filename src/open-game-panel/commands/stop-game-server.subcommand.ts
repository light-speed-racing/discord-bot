import { SubCommand, Handler, IA, On, EventParams } from '@discord-nestjs/core';
import { GameManager } from '../game-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from 'src/database/game-server.entity';
import {
  ActionRowBuilder,
  ClientEvents,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { UseGuards } from '@nestjs/common';
import { HasCustomId } from '../../guard/has-custom-id.guard';
import { HasRole } from 'src/guard/has-role.guard';

@SubCommand({
  name: 'stop',
  description: 'Stop a game server',
})
export class StopGameServerSubcommand {
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {}

  @UseGuards(new HasRole('Host'))
  @Handler()
  async handle(@EventParams() [interaction]: ClientEvents['interactionCreate']) {
    // @ts-expect-error the type for interaction is not correct
    return await interaction.reply({
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(StopGameServerSubcommand.name)
            .setPlaceholder('Select the server you would like to start')
            .addOptions(
              (
                await this.repository.find()
              ).map(
                (server) =>
                  new StringSelectMenuOptionBuilder({
                    label: server.home_name,
                    value: `${server.home_id}`,
                  }),
              ),
            ),
        ),
      ],
    });
  }

  @On('interactionCreate')
  @UseGuards(new HasCustomId(StopGameServerSubcommand.name))
  async onSubmit(@IA() interaction: StringSelectMenuInteraction, @IA('values') [home_id]: number[]) {
    const server = await this.repository.findOne({ where: { home_id } });
    await interaction.deferReply();
    await interaction.editReply({ content: `I'm about to stop **${server.home_name}**. Please wait...` });
    await this.gameManager.stop(server);
    await interaction.followUp({ content: `**${server.home_name}** was stopped. No more playing children!` });
  }
}
