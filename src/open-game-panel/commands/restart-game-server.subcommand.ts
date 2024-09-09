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
  name: 'restart',
  description: 'Restart a game server',
})
export class RestartGameServerSubcommand {
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
            .setCustomId(RestartGameServerSubcommand.name)
            .setPlaceholder('Select the server you would like to restart')
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
  @UseGuards(new HasCustomId(RestartGameServerSubcommand.name))
  async onSubmit(@IA() interaction: StringSelectMenuInteraction, @IA('values') [home_id]: number[]) {
    const server = await this.repository.findOne({ where: { home_id } });
    await interaction.reply({ content: `I'm restarting **${server.home_name}**. Please wait...` });
    await this.gameManager.restart(server);
    return await interaction.followUp({ content: `**${server.home_name}** was restarted.` });
  }
}
