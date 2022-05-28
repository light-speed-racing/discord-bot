import { Param } from '@discord-nestjs/core';
import { IsAlphanumeric } from 'class-validator';
import { ServerBaseDto } from './server-base.dto';

export class SyncDto extends ServerBaseDto {
  @IsAlphanumeric()
  @Param({
    name: 'adminpassword',
    description: 'What should the server admin password be?',
    required: false,
  })
  adminPassword: string;
}
