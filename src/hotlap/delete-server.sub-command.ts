import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'delete',
  description: 'Delete a hotlap server',
})
export class DeleteServerSubcommand {
  private readonly logger = new Logger(DeleteServerSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'DeleteServerSubcommand';
  }
}
