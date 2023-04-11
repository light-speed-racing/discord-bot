import { IsIP, IsNumber, IsString } from 'class-validator';

export class OpenGamePanelDefaultsConfig {
  @IsString()
  url: string;

  @IsNumber()
  port: number;

  @IsIP()
  ip: string;

  @IsString()
  token: string;
}
