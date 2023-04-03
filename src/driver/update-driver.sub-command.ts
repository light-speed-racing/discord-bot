import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'update',
  description: 'Update yourself as a driver',
})
export class UpdateDriverSubcommand {
  private readonly logger = new Logger(UpdateDriverSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'UpdateDriverSubcommand';
  }
}
