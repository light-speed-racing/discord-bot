import { SubCommand, IA, On } from '@discord-nestjs/core';
import { GameManager } from '../game-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { StringSelectMenuInteraction } from 'discord.js';
import { ServerSelectMenu } from './select-menu-with-servers';

@SubCommand({
  name: 'restart',
  description: 'Restart a game server',
})
export class RestartGameServerSubcommand extends ServerSelectMenu {
  constructor(
    @InjectRepository(GameServer)
    readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {
    super(repository);
  }

  @On('interactionCreate')
  async onSubmit(@IA() { customId, values, message }: StringSelectMenuInteraction) {
    if (customId !== 'gameServer') {
      return;
    }

    const selectedServer = this.allServers.at(Number(values.at(0)));

    await message.reply({ content: `I'm restarting **${selectedServer.home_name}**. Please wait...` });
    const response = await this.gameManager.restart(selectedServer);

    return await message.reply({ content: `${response.message}` });
  }
}
