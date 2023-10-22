import { IsString } from 'class-validator';

export class GiphyConfig {
  @IsString()
  readonly apiKey: string;
}
