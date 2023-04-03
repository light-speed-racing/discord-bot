import { SubCommand, Handler } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';

@SubCommand({
  name: 'fetch',
  description: 'Fetch the latest hotlap results',
})
export class FetchResultsSubcommand {
  private readonly logger = new Logger(FetchResultsSubcommand.name);

  @Handler()
  async onRegisterCommand(): Promise<string> {
    return 'FetchResultsSubcommand';
  }
}
