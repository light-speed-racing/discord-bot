import { Command, UseGroup } from '@discord-nestjs/core';
import { CreateHotlapSubcommand } from './create-server.sub-command';
import { FetchEntrylistSubcommand } from './fetch-entrylist.sub-command';

@Command({
  name: 'hotlap',
  description: 'Calculate your fuel usage',
  include: [
    UseGroup(
      { name: 'server', description: 'Handle a hotlap server' },
      CreateHotlapSubcommand,
      FetchEntrylistSubcommand,
    ),
  ],
})
export class HotlapCommand {}
