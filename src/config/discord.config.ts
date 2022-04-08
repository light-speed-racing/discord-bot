import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  token: process.env.DISCORD_TOKEN,
  channels: {
    welcome: process.env.DISCORD_WELCOME_CHANNEL_ID,
    rules: process.env.DISCORD_RULES_CHANNEL_ID,
    whatAreYouPlaying: process.env.DISCORD_WHAT_ARE_YOU_PLAYING_CHANNEL_ID,
    whereAreYouFrom: process.env.DISCORD_WHERE_ARE_YOU_FROM_CHANNEL_ID,
    logging: process.env.DISCORD_LOGGING_CHANNEL_ID,
  },
}));
