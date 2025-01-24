import { IsString } from 'class-validator';

export class OpenaiConfig {
  @IsString()
  readonly apiKey: string;
}
