import { TextInputValue } from '@discord-nestjs/core';

export class UpdateDriverDto {
  @TextInputValue()
  steamId: string;

  @TextInputValue()
  firstName?: string;

  @TextInputValue()
  lastName?: string;
}
