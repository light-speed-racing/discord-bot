import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateDriverSubcommand } from './create-driver.subcommand';
import { DriverCommand } from './driver.command';
import { Driver } from './driver.entity';
import { DriverService } from './driver.service';

@Module({
  imports: [DiscordModule.forFeature(), TypeOrmModule.forFeature([Driver])],
  providers: [DriverService, DriverCommand, CreateDriverSubcommand],
  exports: [DriverService],
})
export class DriverModule {}
