import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class DatabaseConfig {
  @IsString()
  readonly host: string;

  @IsNumber()
  @Type(() => Number)
  readonly port: number;

  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly database_name: string;
}
