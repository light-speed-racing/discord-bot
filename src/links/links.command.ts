import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { BaseCommand } from 'src/common/base.command';

@Injectable()
@Command({
  name: 'links',
  description: 'Cant find a link?',
})
export class LinksCommand extends BaseCommand {
  async handler(): Promise<string> {
    return [
      `For planning all of the Light Speed Racing events we are using the simgrid.`,
      '',
      `Profile: https://www.thesimgrid.com/hosts/light-speed-racing`,
      `Calendar: https://www.thesimgrid.com/hosts/light-speed-racing/calendar`,
    ].join('\n');
  }
}
