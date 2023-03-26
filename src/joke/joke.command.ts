import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
@Command({
  name: 'joke',
  description: 'Let me tell you a joke',
})
export class JokeCommand {
  async handler(): Promise<string> {
    const { data, statusText } = await axios.get('https://api.chucknorris.io/jokes/random');

    return data?.value ?? `Request not completed. ${statusText}`;
  }
}
