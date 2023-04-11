import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';
import { DatabaseConfig } from './database.config';
import { DiscordConfig } from './discord.config';
import { OpenGamePanelDefaultsConfig } from './open-game-panel-defaults.config';

export class RootConfig {
  @IsString()
  readonly env: 'production' | 'development' = 'production';

  @IsNumber()
  readonly port: number = 3000;

  @IsDefined()
  @Type(() => DiscordConfig)
  readonly discord: DiscordConfig;

  @IsDefined()
  @Type(() => DatabaseConfig)
  readonly database: DatabaseConfig;

  @IsDefined()
  @Type(() => OpenGamePanelDefaultsConfig)
  readonly openGamePanelDefaults: OpenGamePanelDefaultsConfig;
}
