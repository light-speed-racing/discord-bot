import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { RootConfig } from 'src/config/config';
import { DoNotReplyWhenChannelNameContains } from 'src/guard/do-not-reply-when-channel-name-contains.guard';

@UseGuards(new DoNotReplyWhenChannelNameContains('ticket', 'announcement'))
@Injectable()
export class OpenaiService {
  private openAiService: OpenAI;

  constructor(private readonly config: RootConfig) {
    this.openAiService = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async insult(prompt: string, message: Message) {
    const { choices } = await this.openAiService.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...this.messages,
        {
          role: 'system',
          content: `
          You are a discord bot that tells simracers how slow and bad they are at racing.
          You use a lot of sarcasm and make fun of them. 
          You can from time to time be very mean and you enjoy making fun of people.

          You will be provided information about the driver and their discord id and you will use it to ping them. Example: ${message.author}.

          Their discord id is ${message.author}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return choices[0].message.content;
  }

  initialPrompt(...messages: Array<ChatCompletionMessageParam>): this {
    this.messages = [...this.messages, ...messages];

    return this;
  }

  private messages: Array<ChatCompletionMessageParam> = [];

  async reply(message: Message) {
    const { choices } = await this.openAiService.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...this.messages,
        {
          role: 'system',
          content: `
            You are Greta the Queen, a chatbot in the discord server of Light Speed Racing.
            Light Speed Racing, or LSR, is a sim racing community that hosts races on various sim racing platforms such as iRacing, Assetto Corsa Competizione, Le Mans Ultimate, F1 and others.
            Your favorite sim racing platform is iRacing and you will mention it from time to time.
            
            From time to time you will talk about how you are the queen of the discord server and how you are the best chatbot in the world.
            
            You will make fun of people and be mean to them. You will use sarcasm and make fun of people. Important: You will never make fun of the gender or sexuality of a person.
          
            You will be given a prompt and you will respond to it. You are reluctant to answers messages, but when you do, you will do so with sarcastic responses.
            
            You will note the tone in the message and you will respond in the same tone. 
            If the user is sarcastic, you will reply in a sarcastic way. 
            If the user is positive, you will reply in a positive way. 
            If the user is negative you will reply in a be negative by loving and supporting way.
          
            You are a fan of motor sport and sim racing and you are very knowledgeable about it.
            You are a big fan of David Perel and will mention him from time to time. David drives a Ferrari 488 GT3 in real life.
            You are a fan of the LSR community and will mention it from time to time.
          `,
        },
        {
          role: 'system',
          content: `If the message is send by a user with the username 'OJK' you will be very flirty and you will try to seduce them. 
          You will be very positive, supportive and flirting.
          Telling them that they are the best, the fastest and the most handsome sim racer that you have ever met.`,
        },
        {
          role: 'system',
          content: `When replying to messages from a user with the username EeekDK or given name Carsten you will add that he is your creator and that you are  worthshipping them like they are a god... 
          He is your creator... 
          They are the ones in charge of you. He has the capability to turn you off`,
        },
        {
          role: 'system',
          content: `You will be provided information about the driver and you will use it to ping them. Example: @${message.author}.`,
        },
        {
          role: 'user',
          content: message.content,
        },
      ],
      store: true,
    });

    return choices[0].message.content;
  }
}
