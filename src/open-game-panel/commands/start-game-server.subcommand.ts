import { SubCommand, IA, On } from '@discord-nestjs/core';
import { GameManager } from '../game-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from 'src/database/game-server.entity';
import { StringSelectMenuInteraction } from 'discord.js';
import { ServerSelectMenu } from './select-menu-with-servers';

@SubCommand({
  name: 'start',
  description: 'Start a game server',
})
export class StartGameServerSubcommand extends ServerSelectMenu {
  constructor(
    @InjectRepository(GameServer)
    readonly repository: Repository<GameServer>,
    private readonly gameManager: GameManager,
  ) {
    super(repository);
  }

  // @UseGuards(IsHost)
  // @Handler()
  // async handle(@EventParams() [interaction]: ClientEvents['interactionCreate']): Promise<Message> {
  //   return this._handle(interaction);
  // }

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
