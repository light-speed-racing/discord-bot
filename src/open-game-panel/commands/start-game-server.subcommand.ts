import { SlashCommandPipe } from '@discord-nestjs/common';
import { SubCommand, Handler, IA, EventParams } from '@discord-nestjs/core';
import { GameServerDto } from './game-server.dto';
import { GameManager } from '../game-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { ClientEvents, Message } from 'discord.js';

@SubCommand({
  name: 'start',
  description: 'Control a game server',
})
export class StartGameServerSubcommand {
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {}

  @Handler()
  async handle(
    @IA(SlashCommandPipe) dto: GameServerDto,
    @EventParams() [interaction]: ClientEvents['interactionCreate'],
  ): Promise<Message> {
    const entity = await this.repository.findOneBy({ home_name: dto.server });

    if (!entity) {
      const all = await this.repository.find({ select: ['home_name'] });

      return await interaction.channel.send(
        [
          `I could not find the server with name the name **'${dto.server}'**.`,
          '',
          `These are the servers that I know of:`,
          all.map((x) => `* ${x.home_name}`).join('\n'),
        ].join('\n'),
      );
    }

    const response = await this.gameManager.start(entity);

    await interaction.channel.send(`**${entity.home_name}** ${response.message}`);
  }
}
