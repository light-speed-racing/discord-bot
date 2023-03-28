import { Module } from '@nestjs/common';
import { HotlapService } from './hotlap.service';

@Module({
  providers: [HotlapService]
})
export class HotlapModule {}
