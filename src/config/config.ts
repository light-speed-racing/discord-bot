import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { DatabaseConfig } from './database.config';
import { DiscordConfig } from './discord.config';
import { GiphyConfig } from './giphy.config';
import { OpenGamePanelConfig } from './open-game-panel.config';
import { LfmConfig } from './lfm.config';
import { SimgridConfig } from './simgrid.config';

export class RootConfig {
  @IsString()
  readonly env: 'production' | 'development' = 'production';

  @IsNumber()
  @Type(() => Number)
  readonly port: number;

  @Type(() => DiscordConfig)
  @ValidateNested()
  readonly discord: DiscordConfig;

  @Type(() => DatabaseConfig)
  @ValidateNested()
  readonly database: DatabaseConfig;

  @Type(() => GiphyConfig)
  @ValidateNested()
  readonly giphy: GiphyConfig;

  @Type(() => LfmConfig)
  @ValidateNested()
  readonly lfm: LfmConfig;

  @Type(() => SimgridConfig)
  @ValidateNested()
  readonly simgrid: SimgridConfig;

  @Type(() => OpenGamePanelConfig)
  @ValidateNested()
  readonly openGamePanel: OpenGamePanelConfig;
}
