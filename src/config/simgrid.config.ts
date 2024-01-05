import { IsString } from 'class-validator';

export class SimgridConfig {
  @IsString()
  readonly url: string;

  @IsString()
  readonly token: string;
}
