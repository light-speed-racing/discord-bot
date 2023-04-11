import { Handler, SubCommand } from '@discord-nestjs/core';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

type Response = {
  categories: string[];
  created_at: Date;
  icon_url: string;
  id: string;
  updated_at: Date;
  url: string;
  value: string;
};
@SubCommand({
  name: 'chuck-norris',
  description: 'Let me tell you a joke about Chuck Norris',
})
export class ChuckNorrisJokeCommand {
  private readonly logger = new Logger(ChuckNorrisJokeCommand.name);
  constructor(private readonly httpService: HttpService) {}
  private readonly url = 'https://api.chucknorris.io/jokes/random';

  @Handler()
  async handler(): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService.get<Response>(this.url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw `Request not completed. ${error.message}`;
        }),
      ),
    );
    return data.value;
  }
}
