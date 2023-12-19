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
import { IsHost } from 'src/guard/is-host.guard';
import { UseGuards } from '@nestjs/common';

@SubCommand({
  name: 'start',
  description: 'Start a game server',
})
export class StartGameServerSubcommand {
  private allServers: Array<GameServer>;
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {}

  @UseGuards(IsHost)
  @Handler()
  async handle(@EventParams() [interaction]: ClientEvents['interactionCreate']): Promise<Message> {
    this.allServers = await this.repository.find();

    const server = new StringSelectMenuBuilder()
      .setCustomId('gameServer')
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
  async onSubmit(@IA() { customId, values, message }: StringSelectMenuInteraction) {
    if (customId !== 'gameServer') {
      return;
    }

    const selectedServer = this.allServers.at(Number(values.at(0)));

    await message.reply({ content: `I'm starting **${selectedServer.home_name}**. Please wait...` });
    const response = await this.gameManager.start(selectedServer);

    return await message.reply({ content: `${response.message}` });
  }
}
