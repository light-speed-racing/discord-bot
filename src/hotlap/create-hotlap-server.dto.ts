import { TextInputValue } from '@discord-nestjs/core';

export class CreateHotlapServerDto {
  @TextInputValue()
  title: string;

  @TextInputValue()
  entrylistUrl: string;
}
