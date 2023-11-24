import { Module } from '@nestjs/common';
import { GiphyService } from './giphy.service';

@Module({
  providers: [GiphyService],
  exports: [GiphyService],
})
export class GiphyModule {}
