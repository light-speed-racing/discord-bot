import { Choice, Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';
import { Championships } from '../championships';
import { YesOrNo } from './yes-or-no.enum';

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
