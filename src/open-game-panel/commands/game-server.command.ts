import { Command } from '@discord-nestjs/core';
import { RestartGameServerSubcommand } from './restart-game-server.subcommand';

@Command({
  name: 'game-server',
  description: 'Control a game server',
  include: [RestartGameServerSubcommand],
})
export class GameServerCommand {}
