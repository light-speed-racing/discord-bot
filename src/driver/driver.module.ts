import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { RegisterDriverSubCommand } from './register-driver.sub-command';
import { DriverService } from './driver.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { DriverCommand } from './driver.command';
import { UpdateDriverSubCommand } from './update-driver.sub-command';

@Module({
  imports: [DiscordModule.forFeature(), TypeOrmModule.forFeature([Driver])],
  providers: [DriverService, DriverCommand, RegisterDriverSubCommand, UpdateDriverSubCommand],
  exports: [DriverService],
})
export class DriverModule {}
