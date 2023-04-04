import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DriverCommand } from './driver.command';
import { RegisterDriverSubcommand } from './register-driver.sub-command';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver.entity';

@Module({
  imports: [DiscordModule.forFeature(), TypeOrmModule.forFeature([Driver])],
  providers: [DriverCommand, RegisterDriverSubcommand, DriverService],
  exports: [DriverService],
})
export class DriverModule {}
