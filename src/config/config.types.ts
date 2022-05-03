import { DiscordConfig } from './discord.config';
import { BaseConfig } from './base.config';
import { ApiKeysConfig } from './apiKeys.config';
import { SimgridConfig } from './simgrid.config';

export type Config = {
  discord: DiscordConfig;
  base: BaseConfig;
  apiKeys: ApiKeysConfig;
  simgrid: SimgridConfig;
};
