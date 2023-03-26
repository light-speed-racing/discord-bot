import { IsString } from 'class-validator';

export class DiscordConfig {
  @IsString()
  public readonly token!: string;
  @IsString()
  public readonly guildId!: string;
}
