import { Command } from '@discord-nestjs/core';
import { StartGameServerSubcommand } from './start-game-server.subcommand';

@Command({
  name: 'game-server',
  description: 'Control a game server',
  include: [StartGameServerSubcommand],
})
export class GameServerCommand {}
