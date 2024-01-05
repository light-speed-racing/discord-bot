import { Module } from '@nestjs/common';
import { EntrylistService } from './entrylist.service';
import { HttpModule } from '@nestjs/axios';
import { SimgridApi } from './simgrid-api.service';
import { SimgridHttpConfig } from './simgrid-http.config';
import { ChampionshipsController } from './championships.controller';

@Module({
  controllers: [ChampionshipsController],
  imports: [HttpModule.registerAsync({ useClass: SimgridHttpConfig })],
  providers: [EntrylistService, SimgridApi],
  exports: [EntrylistService, SimgridApi],
})
export class SimgridModule {}
