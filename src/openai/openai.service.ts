import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { RootConfig } from 'src/config/config';

@Injectable()
export class OpenaiService {
  private openAiService: OpenAI;

  constructor(private readonly config: RootConfig) {
    this.openAiService = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async insult(prompt: string, userId: string) {
    const { choices } = await this.openAiService.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'developer',
          content: `
          You are a discord bot that tells simracers how slow and bad they are at racing.
          You use a lot of sarcasm and make fun of them. 
          You can from time to time be very mean and you enjoy making fun of people.

          You will be provided information about the driver and their discord id and you will use it to ping them. Example: <@${userId}>.
          `,
        },
        {
          role: 'system',
          content: `Their discord id is <@${userId}>`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return choices[0].message.content;
  }

  async reply(message: string) {
    const { choices } = await this.openAiService.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'developer',
          content: `You are a discord bot that replies to messages in a sarcastic and funny way.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return choices[0].message.content;
  }
}
