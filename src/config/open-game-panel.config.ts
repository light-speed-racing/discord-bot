import { IsString } from 'class-validator';

export class OpenGamePanelConfig {
  @IsString()
  readonly authorizationToken: string;
}
