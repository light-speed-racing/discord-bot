import { registerAs } from '@nestjs/config';
import 'dotenv/config';

const config = {
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID ?? '937348963831541800',

  channels: {
    welcome: process.env.DISCORD_WELCOME_CHANNEL_ID || '937348963831541802',
    rules: process.env.DISCORD_RULES_CHANNEL_ID || '937349666503278592',
    whatAreYouPlaying:
      process.env.DISCORD_WHAT_ARE_YOU_PLAYING_CHANNEL_ID ||
      '937619935365054504',
    whereAreYouFrom:
      process.env.DISCORD_WHERE_ARE_YOU_FROM_CHANNEL_ID || '937630679263498282',
    introduceYourSelf:
      process.env.DISCORD_INTRODUCE_YOURSELF_CHANNEL_ID || '937351001793503333',
    events: process.env.DISCORD_EVENTS_CHANNEL_ID || '962597302411870258',
    general: process.env.DISCORD_GENERAL_CHANNEL_ID || '937350227118161980',
    links: process.env.DISCORD_LINKS_CHANNEL_ID || '961380805928710164',
    logging: process.env.DISCORD_LOGGING_CHANNEL_ID,
  },
};

export type DiscordConfig = typeof config;

export default registerAs('discord', (): DiscordConfig => config);
