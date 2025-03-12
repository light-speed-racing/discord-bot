import { CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import { ChannelType, Client, Message, MessageType } from 'discord.js';
import { MessageIsSendByAUser } from './message-is-send-by-a-user.guard';
import { InjectDiscordClient } from '@discord-nestjs/core';

interface DiscordExecutionContext extends ExecutionContext {
  getMessage(): Message;
}

@UseGuards(MessageIsSendByAUser)
export class IAmMentionedOrRepliedTo implements CanActivate {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  async canActivate(context: DiscordExecutionContext): Promise<boolean> {
    const message = context.getArgByIndex<Message>(0);

    if (message.channel.type === ChannelType.AnnouncementThread) {
      return;
    }

    const reference = !!message.reference && (await message.channel.messages.fetch(message.reference.messageId));

    return (
      message.content.toLowerCase().includes('greta') ||
      message.mentions.users.has(this.client.user.id) ||
      (message.type === MessageType.Reply && reference.author.id === this.client.user.id)
    );
  }
}
