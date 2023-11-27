import { Module } from '@nestjs/common';
import { BopJob } from './bop.job';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [BopJob],
  exports: [BopJob],
})
export class JobModule {}
