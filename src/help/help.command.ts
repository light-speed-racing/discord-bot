import { Command, DiscordCommandProvider } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ApplicationCommandData } from 'discord.js';

@Injectable()
@Command({
  name: 'help',
  description: 'Need help?',
})
export class HelpCommand {
  constructor(private readonly commandProvider: DiscordCommandProvider) {}

  async handler(): Promise<string> {
    return Array.from(this.commandProvider.getAllCommands())
      .map(
        ([, value]: [any, ApplicationCommandData & { description: string }]) =>
          `**/${value.name}** - ${value?.description ?? ''}`,
      )
      .join('\n');
  }
}
