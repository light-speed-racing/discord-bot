import { Handler, SubCommand } from '@discord-nestjs/core';
import axios from 'axios';

@SubCommand({
  name: 'chuck-norris',
  description: 'Let me tell you a joke about Chuck Norris',
})
export class ChuckNorrisJokeCommand {
  @Handler()
  async handler(): Promise<string> {
    const { data, statusText } = await axios.get('https://api.chucknorris.io/jokes/random');

    return data?.value ?? `Request not completed. ${statusText}`;
  }
}
