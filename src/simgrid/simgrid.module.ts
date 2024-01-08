import { Module } from '@nestjs/common';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { BalanceOfPerformanceService } from './balance-of-performance.service';

@Module({
  imports: [HttpModule],
  providers: [EntrylistService, BalanceOfPerformanceService],
  exports: [EntrylistService, BalanceOfPerformanceService],
})
export class SimgridModule {}
