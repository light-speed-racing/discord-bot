import { Choice, Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';
import { Championships } from '../championships';
import { YesOrNo } from './yes-or-no.enum';

export class EntryListDto {
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

  @IsAlphanumeric()
  @Param({
    name: 'teamevent',
    description: 'Is this a team event?',
    required: false,
  })
  @Choice(YesOrNo)
  teamevent: YesOrNo;
}
