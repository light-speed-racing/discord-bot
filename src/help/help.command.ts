import { Command, DiscordCommandProvider } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ApplicationCommandData } from 'discord.js';
import { BaseCommand } from 'src/common/base.command';

@Injectable()
@Command({
  name: 'help',
  description: 'Need help?',
})
export class HelpCommand extends BaseCommand {
  constructor(private readonly commandProvider: DiscordCommandProvider) {
    super();
  }

  async handler(): Promise<string> {
    return Array.from(this.commandProvider.getAllCommands())
      .map(
        ([, value]: [any, ApplicationCommandData & { description: string }]) =>
          `**/${value.name}** - ${value?.description ?? ''}`,
      )
      .join('\n');
  }
}
