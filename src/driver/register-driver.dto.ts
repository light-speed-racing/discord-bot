import { TextInputValue } from '@discord-nestjs/core';

export class RegisterDriverDto {
  @TextInputValue()
  steamId: string;

  @TextInputValue()
  firstName?: string;

  @TextInputValue()
  lastName?: string;
}
