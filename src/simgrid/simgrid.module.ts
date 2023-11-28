import { Module } from '@nestjs/common';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { PatreonModule } from 'src/patreon/patreon.module';

@Module({
  imports: [HttpModule, PatreonModule],
  providers: [EntrylistService],
  exports: [EntrylistService],
})
export class SimgridModule {}
