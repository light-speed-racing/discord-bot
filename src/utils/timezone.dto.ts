import { Choice, Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';

enum Timezones {
  UK = 'Europe/London',
  CET = 'Europe/Copenhagen',
}

export class TimezoneDto {
  @IsAlphanumeric()
  @Param({
    name: 'tz',
    description: 'What timezone are you looking for?',
    required: true,
  })
  @Choice(Timezones)
  tz: Timezones;
}
