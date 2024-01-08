import { IsString } from 'class-validator';

export class OpenGamePanelConfig {
  @IsString()
  readonly authorization_token: string;

  @IsString()
  readonly ip: string;

  @IsString()
  readonly api_token: string;
}
