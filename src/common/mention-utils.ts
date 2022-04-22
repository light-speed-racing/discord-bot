import { ChannelMention, RoleMention, UserMention } from 'discord.js';

export class MentionUtils {
  static toId = (mention: UserMention | RoleMention | ChannelMention): string =>
    `${mention.match(/\d+/g)}`;

  static mention = (
    kind: 'USER' | 'CHANNEL' | 'ROLE',
    id: string,
  ): UserMention | RoleMention | ChannelMention => {
    switch (kind) {
      case 'CHANNEL':
        return `<#${id}>`;
      case 'ROLE':
        return `<@&${id}>`;
      case 'USER':
        return `<@${id}>`;
    }
  };
}
