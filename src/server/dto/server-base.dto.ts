import { Choice, Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';
import { Championships } from '../enum/championships.enum';
import { YesOrNo } from '../enum/yes-or-no.enum';

export class ServerBaseDto {
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
    name: 'forceentrylist',
    description: 'Force entry list?',
    required: false,
  })
  @Choice(YesOrNo)
  forceentrylist: YesOrNo;
}
