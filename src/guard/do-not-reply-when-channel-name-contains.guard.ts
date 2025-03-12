import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChannelType, Message } from 'discord.js';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

@Injectable()
export class DoNotReplyWhenChannelNameContains implements CanActivate {
  private readonly names: string[];

  constructor(...names: string[]) {
    this.names = names;
  }

  canActivate(context: DiscordExecutionContext): boolean {
    const message = context.getArgByIndex<Message>(0);
    const channel = message.channel;

    if (
      channel.type === ChannelType.AnnouncementThread ||
      channel.type === ChannelType.GuildAnnouncement ||
      channel.isThread()
    ) {
      return false;
    }

    if (channel.isDMBased()) {
      return true;
    }

    return !this.names.some((name) => channel.name.includes(name));
  }
}
