import { IsString } from 'class-validator';

export class OpenGamePanelConfig {
  @IsString()
  readonly authorizationToken: string;

  @IsString()
  readonly ip: string;

  @IsString()
  readonly apiToken: string;
}
