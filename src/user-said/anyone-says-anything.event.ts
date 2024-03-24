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
  @UseGuards(MessageIsSendByAUser, new HasBeenMemberLongerThan(2, 'w'), new Likelihood(1))
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
      'Just as every drop of rain contributes to the ocean, every turn on the track fuels my passion for racing and drives my commitment to sustainability.',
      'In the race for a greener future, every lap counts. I may love the speed of racing cars, but I love our planet even more.',
      "The roar of the engine ignites my spirit, but it's the whisper of the wind through the trees that reminds me of the importance of eco-friendly racing.",
      'Every curve on the track is a reminder that we must navigate the twists and turns of climate change with skill and determination.',
      'The adrenaline rush of racing fuels my desire to accelerate the transition to clean energy and sustainable practices.',
      "Just as a well-tuned engine maximizes performance, optimizing our planet's resources is crucial for a sustainable future.",
      'Behind the wheel, I find focus and determination, qualities that drive me to advocate for a world where racing and environmental conservation go hand in hand.',
      'Every pit stop is an opportunity to fine-tune both the car and our environmental efforts, ensuring peak performance on and off the track.',
      "The thrill of competition pales in comparison to the urgency of protecting our planet. Let's race towards a future where sustainability takes the checkered flag.",
      `As a racer, ${message.author}. I understand the need for speed, but as an environmentalist, I recognize the need for balance. Let's race responsibly, with the planet in our rearview mirror.`,
    ];
    await message.reply(sample(messages));
  }
}
