import { Command } from '@discord-nestjs/core';
import { RestartGameServerSubcommand } from './restart-game-server.subcommand';
import { StartGameServerSubcommand } from './start-game-server.subcommand';
import { StopGameServerSubcommand } from './stop-game-server.subcommand';

@Command({
  name: 'game-server',
  description: 'Control a game server',
  include: [RestartGameServerSubcommand, StartGameServerSubcommand, StopGameServerSubcommand],
})
export class GameServerCommand {}
