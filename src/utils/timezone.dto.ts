import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsAlphanumeric } from 'class-validator';

export const Timezones = {
  UK: 'Europe/London',
  CET: 'Europe/Copenhagen',
};

export class TimezoneDto {
  @Transform(({ value }) => value.toUpperCase())
  @IsAlphanumeric()
  @Param({
    name: 'tz',
    description: 'What timezone are you looking for?',
    required: true,
  })
  tz: string;
}
