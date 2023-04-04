import { Command, UseGroup } from '@discord-nestjs/core';
import { MakeSubcommand } from './create-server.sub-command';
import { UpdateServerSubcommand } from './update-server.sub-command';
import { FetchResultsSubcommand } from './update-results.sub-command';

@Command({
  name: 'hotlap',
  description: 'Calculate your fuel usage',
  include: [
    UseGroup(
      { name: 'server', description: 'Handle a hotlap server' },
      MakeSubcommand,
      UpdateServerSubcommand,
    ),
    UseGroup({ name: 'results', description: 'Handle hotlap results' }, FetchResultsSubcommand),
  ],
})
export class HotlapCommand {}
