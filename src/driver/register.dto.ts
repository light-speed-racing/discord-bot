import { TextInputValue } from '@discord-nestjs/core';

export class RegisterDto {
  @TextInputValue()
  steamId: string;

  @TextInputValue()
  firstName?: string;

  @TextInputValue()
  lastName?: string;
}
