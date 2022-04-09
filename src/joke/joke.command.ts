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
    return await (
      await axios.get('https://api.chucknorris.io/jokes/random')
    ).data?.value;
  }
}
