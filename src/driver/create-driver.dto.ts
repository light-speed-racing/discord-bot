import { TextInputValue } from '@discord-nestjs/core';

export class CreateDriverDto {
  @TextInputValue()
  steamId: string;

  @TextInputValue()
  firstName?: string;

  @TextInputValue()
  lastName?: string;
}
