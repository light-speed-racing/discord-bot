import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { HotlapCommand } from './hotlap.command';
import { MakeSubcommand } from './create-server.sub-command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotlap } from './hotlap.entity';
import { Lap } from './lap.entity';
import { HotlapService } from './hotlap.service';
import { LapService } from './lap.service';

@Module({
  imports: [DiscordModule.forFeature(), TypeOrmModule.forFeature([Hotlap, Lap])],
  providers: [HotlapCommand, MakeSubcommand, HotlapService, LapService],
  exports: [HotlapService, LapService],
})
export class HotlapModule {}
