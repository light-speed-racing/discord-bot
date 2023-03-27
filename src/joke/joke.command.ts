import { Command, Handler } from '@discord-nestjs/core';
import axios from 'axios';

@Command({
  name: 'joke',
  description: 'Let me tell you a joke',
})
export class JokeCommand {
  @Handler()
  async handler(): Promise<string> {
    const { data, statusText } = await axios.get('https://api.chucknorris.io/jokes/random');

    return data?.value ?? `Request not completed. ${statusText}`;
  }
}
