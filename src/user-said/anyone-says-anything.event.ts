import { On } from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageIsSendByAUser } from 'src/guard/message-is-send-by-a-user.guard';
import sample from 'lodash.sample';
import { Likelihood } from 'src/guard/likelyhood.guard';
import { HasBeenMemberLongerThan } from 'src/guard/has-been-member-longer-than.guard';

@Injectable()
export class AnyoneSaysAnythingEvent {
  @On('messageCreate')
  @UseGuards(MessageIsSendByAUser, new HasBeenMemberLongerThan(2, 'w'), new Likelihood(2))
  async onMessage(message: Message): Promise<void> {
    const messages = [
      `I am sooo mad at you!!! How dare you...!! Go hug a tree and give me proof or I will ban you! #furyofgreta`,
      `I will ban you ${message.author}!!`,
      `How dare you say my name ${message.author}?!`,
      `I own 100 private jets. What do you have ${message.author}? A gas driven car?!?`,
      `You're a nuclear reactor to me ${message.author}`,
      `${message.author} makes me want to glue myself onto the next road?`,
      `${message.author}, your carbon footprint is bigger than their brain capacity!`,
      `The only rise I see here is the rise in my frustration level due to your climate indifference.`,
      `If ignorance was a greenhouse gas, you would be the main source!`,
      `You're glued to fossil fuels, just like you're glued to ignorance, ${message.author}!`,
      `${message.author}, I'd make your ass grass but garbage is bad for the environment`,
      `You're treating the planet like it's your own personal garbage dump. Time for an eco-reality check!`,
      `If excuses were renewable energy, you'd have solved the climate crisis by now, ${message.author}!`,
      `${message.author}'s carbon footprint is so extravagant, it's like you're auditioning for a starring role in 'Planet Polluter: The Sequel.'`,
      `I've seen more sustainable practices in a toddler's finger painting than in your daily routine!`,
    ];
    await message.reply(sample(messages));
  }
}
