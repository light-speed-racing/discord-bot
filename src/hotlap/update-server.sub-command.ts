import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'update',
  description: 'Update a hotlap server',
})
export class UpdateServerSubcommand {
  private readonly logger = new Logger(UpdateServerSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'UpdateServerSubcommand';
  }
}
