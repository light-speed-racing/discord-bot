import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
@Command({
  name: 'joke',
  description: 'Tell a joke',
})
@UsePipes(TransformPipe)
export class JokeCommand implements DiscordTransformedCommand<undefined> {
  async handler(): Promise<string> {
    return await (
      await axios.get('https://api.chucknorris.io/jokes/random')
    ).data?.value;
  }
}
