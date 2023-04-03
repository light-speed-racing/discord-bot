import { Command } from '@discord-nestjs/core';
import { ChuckNorrisJokeCommand } from './chuck-norris.command';

@Command({
  name: 'joke',
  description: 'Let me tell you a joke',
  include: [ChuckNorrisJokeCommand],
})
export class JokeCommand {}
