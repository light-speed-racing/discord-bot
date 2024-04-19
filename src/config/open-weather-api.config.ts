import { IsString } from 'class-validator';

export class OpenWeatherApiConfig {
  @IsString()
  readonly token: string;
}
