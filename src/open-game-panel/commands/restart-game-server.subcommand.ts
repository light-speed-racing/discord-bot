import { SubCommand, Handler, IA, EventParams, On } from '@discord-nestjs/core';
import { GameManager } from '../game-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from 'src/database/game-server.entity';
import {
  ActionRowBuilder,
  ClientEvents,
  Message,
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
  private allServers: Array<GameServer>;
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {}

  @UseGuards(new HasRole('Host'))
  @Handler()
  async handle(@EventParams() [interaction]: ClientEvents['interactionCreate']): Promise<Message> {
    this.allServers = await this.repository.find();

    const server = new StringSelectMenuBuilder()
      .setCustomId(RestartGameServerSubcommand.name)
      .setPlaceholder('Select a server')
      .addOptions(
        this.allServers.map(({ home_name }, index) => {
          return new StringSelectMenuOptionBuilder().setLabel(home_name).setValue(`${index}`);
        }),
      );

    // @ts-expect-error sdfdsf
    return await interaction.reply({
      components: [new ActionRowBuilder().addComponents(server)],
    });
  }

  @On('interactionCreate')
  @UseGuards(new HasCustomId(RestartGameServerSubcommand.name))
  async onSubmit(@IA() { values, message }: StringSelectMenuInteraction) {
    const selectedServer = this.allServers.at(Number(values.at(0)));

    await message.reply({ content: `I'm restarting **${selectedServer.home_name}**. Please wait...` });
    const response = await this.gameManager.restart(selectedServer);

    return await message.reply({ content: `${response.message}` });
  }
}
