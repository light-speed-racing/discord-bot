import { Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';
import { EntryListDto } from './entrylist.dto';

export class ServerConfigDto extends EntryListDto {
  @IsAlphanumeric()
  @Param({
    name: 'adminpassword',
    description: 'What should the server admin password be?',
    required: false,
  })
  adminPassword: string;
}
