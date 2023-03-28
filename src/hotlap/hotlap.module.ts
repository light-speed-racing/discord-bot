import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotlap } from './hotlap.entity';
import { HotlapService } from './hotlap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hotlap])],
  providers: [HotlapService],
})
export class HotlapModule {}
