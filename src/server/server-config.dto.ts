import { Choice, Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';

export enum Championships {
  // 'Midweek League' = '1078',
  'Mixed Sundays' = '1209',
  'Summer Challange' = '1366',
}

export enum YesOrNo {
  Yes = '1',
  No = '0',
}

export class ServerConfigDto {
  @IsAlphanumeric()
  @Param({
    name: 'championship',
    description: 'What championship?',
    required: true,
  })
  @Choice(Championships)
  championship: Championships;

  @IsAlphanumeric()
  @Param({
    name: 'adminpassword',
    description: 'What should the server admin password be?',
    required: false,
  })
  adminPassword: string;

  @IsAlphanumeric()
  @Param({
    name: 'forceentrylist',
    description: 'Force entry list?',
    required: false,
  })
  @Choice(YesOrNo)
  forceentrylist: YesOrNo;
}
