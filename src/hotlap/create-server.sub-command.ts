import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'make',
  description: 'Make a hotlap server',
})
export class MakeSubcommand {
  private readonly logger = new Logger(MakeSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'MakeSubcommand';
  }
}
