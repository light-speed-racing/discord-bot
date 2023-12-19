import { Command } from '@discord-nestjs/core';
import { StartGameServerSubcommand } from './start-game-server.subcommand';
import { StopGameServerSubcommand } from './stop-game-server.subcommand';
import { RestartGameServerSubcommand } from './restart-game-server.subcommand';

@Command({
  name: 'game-server',
  description: 'Control a game server',
  include: [StartGameServerSubcommand, StopGameServerSubcommand, RestartGameServerSubcommand],
})
export class GameServerCommand {}
