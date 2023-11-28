import { Module } from '@nestjs/common';
import { PatreonService } from './patreon.service';

@Module({
  providers: [PatreonService],
  exports: [PatreonService],
})
export class PatreonModule {}
