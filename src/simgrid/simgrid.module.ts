import { Module } from '@nestjs/common';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [EntrylistService],
  exports: [EntrylistService],
})
export class SimgridModule {}
