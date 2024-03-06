import { Module } from '@nestjs/common';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { BalanceOfPerformanceService } from './balance-of-performance.service';
import { SimgridService } from './simgrid.service';
import { SimgridHttpConfig } from './simgrid-http.config';

@Module({
  imports: [HttpModule.registerAsync({ useClass: SimgridHttpConfig })],
  providers: [EntrylistService, BalanceOfPerformanceService, SimgridService],
  exports: [EntrylistService, BalanceOfPerformanceService, SimgridService],
})
export class SimgridModule {}
