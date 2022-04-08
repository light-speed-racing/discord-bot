import { Logger } from '@nestjs/common';

export abstract class BaseCommand {
  readonly logger = new Logger(this.constructor.name);
}
