import { IsString } from 'class-validator';

export class DiscordConfig {
  @IsString()
  public readonly token!: string;
  @IsString()
  public readonly guild_id!: string;

  @IsString()
  public readonly logging_channel_id!: string;
}
