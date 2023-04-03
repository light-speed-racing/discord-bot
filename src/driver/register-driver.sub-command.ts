import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'register',
  description: 'Register yourself as a driver',
})
export class RegisterDriverSubcommand {
  private readonly logger = new Logger(RegisterDriverSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'RegisterDriverSubcommand';
  }
}
