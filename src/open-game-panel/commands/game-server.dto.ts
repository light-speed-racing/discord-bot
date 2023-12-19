import { Param } from '@discord-nestjs/core';

export class GameServerDto {
  @Param({
    name: 'server',
    description: 'Name of the server',
    required: true,
  })
  server: string;
}
