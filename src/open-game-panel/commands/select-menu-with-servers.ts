import { InjectRepository } from '@nestjs/typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { Repository } from 'typeorm';
import {
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ClientEvents,
} from 'discord.js';
import { UseGuards } from '@nestjs/common';
import { EventParams, Handler } from '@discord-nestjs/core';
import { IsHost } from 'src/guard/is-host.guard';

export class ServerSelectMenu {
  public allServers: Array<GameServer>;
  constructor(
    @InjectRepository(GameServer)
    readonly repository: Repository<GameServer>,
  ) {}

  @UseGuards(IsHost)
  @Handler()
  async handle(@EventParams() [interaction]: ClientEvents['interactionCreate']): Promise<Message> {
    this.allServers = await this.repository.find();

    const select = new StringSelectMenuBuilder()
      .setCustomId('gameServer')
      .setPlaceholder('Select a server')
      .addOptions(
        this.allServers.map(({ home_name }, index) => {
          return new StringSelectMenuOptionBuilder().setLabel(home_name).setValue(`${index}`);
        }),
      );

    // @ts-expect-error sdfdsf
    return await interaction.reply({
      components: [new ActionRowBuilder().addComponents(select)],
    });
  }
}
