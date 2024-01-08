import { IsString } from 'class-validator';

export class LfmConfig {
  @IsString()
  readonly url: string;

  @IsString()
  readonly token: string;
}
