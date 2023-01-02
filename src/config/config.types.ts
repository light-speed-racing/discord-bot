import { DiscordConfig } from './discord.config';
import { BaseConfig } from './base.config';
import { ApiKeysConfig } from './apiKeys.config';

export type Config = {
  discord: DiscordConfig;
  base: BaseConfig;
  apiKeys: ApiKeysConfig;
};

export { DiscordConfig, BaseConfig, ApiKeysConfig };
