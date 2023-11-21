import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OgpCustomFieldsDto {
  @IsString()
  @IsOptional()
  entrylistUrl?: string;

  @IsOptional()
  @IsNumber()
  channelId?: number;

  @IsOptional()
  @IsNumber()
  roleId?: number;
}
