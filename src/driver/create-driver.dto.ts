import { Field } from '@discord-nestjs/core';
import { TextInputModalData } from 'discord.js';

export class CreateDriverDto {
  steamId: string;
  discordId?: string;
  firstName?: string;
  lastName?: string;
}

export class CreateDriverDtoModalSubmit {
  @Field('steamId')
  steamId: TextInputModalData;

  @Field('firstName')
  firstName?: TextInputModalData;

  @Field('lastName')
  lastName?: TextInputModalData;
}
