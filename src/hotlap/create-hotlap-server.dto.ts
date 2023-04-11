import { TextInputValue } from '@discord-nestjs/core';

export class CreateHotlapServerDto {
  @TextInputValue()
  title: string;

  @TextInputValue()
  ogpUrl: string;

  @TextInputValue()
  ogpToken: string;

  @TextInputValue()
  ogpIp: string;

  @TextInputValue()
  ogpPort: number;
}
