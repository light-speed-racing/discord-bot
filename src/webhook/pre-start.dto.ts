import { IsString } from 'class-validator';

export class PreStartDto {
  @IsString()
  homedir: string;
}
