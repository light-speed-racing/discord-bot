import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsAlphanumeric } from 'class-validator';

export class SteerlockDto {
  @Transform(({ value }) => value.toUpperCase())
  @IsAlphanumeric()
  @Param({
    name: 'car',
    description: 'Name of the car',
    required: true,
  })
  car: string;
}
