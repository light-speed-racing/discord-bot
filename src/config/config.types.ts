export type Config = {
  discord: DiscordConfig;
  base: BaseConfig;
  apiKeys: ApiKeysConfig;
  simgrid: SimgridConfig;
};

export type DiscordConfig = {
  token: string;
  guildId: string;

  channels: {
    welcome: string;
    rules: string;
    whatAreYouPlaying: string;
    whereAreYouFrom: string;
    introduceYourSelf: string;
    events: string;
    general: string;
    links: string;
    logging: string;
  };
};

export type BaseConfig = {
  env: string;
  port: number;
  logo: string;
};

export type ApiKeysConfig = {
  giphy: string;
};

export type SimgridConfig = {
  profile: string;
  calendar: string;
};
