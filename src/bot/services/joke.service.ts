import { Injectable } from '@nestjs/common';
import Axios from 'axios';

@Injectable()
export class JokeService {
  private readonly http = Axios;

  async tellJoke() {
    return await (
      await Axios.get('https://api.chucknorris.io/jokes/random')
    ).data?.value;
  }
}
