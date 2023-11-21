import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OgpCustomFieldsDto {
  @IsString()
  @IsOptional()
  entrylist_url?: string;

  @IsOptional()
  @IsNumber()
  channel_id?: number;

  @IsOptional()
  @IsNumber()
  role_id?: number;
}
