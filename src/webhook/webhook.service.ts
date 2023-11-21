import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Entrylist } from './entrylist.type';
import { PreStartDto } from './pre-start.dto';

const emtryEntrylist: Entrylist = {
  entries: [],
  forceEntrylist: 0,
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly httpService: HttpService) {}

  async entrylist({ entrylistUrl }: PreStartDto): Promise<Entrylist> {
    if (!entrylistUrl) {
      this.logger.log('No url provided. Returning default empty entrylist');
      return { ...emtryEntrylist };
    }

    const { data } = await firstValueFrom(
      this.httpService.get<Entrylist>(entrylistUrl).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Could not fetch entrylist for ${entrylistUrl}`, error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    if (!data) {
      return { ...emtryEntrylist };
    }
    return data;
  }

  async sendMessageInChannel({ channelId }: PreStartDto) {
    console.log(channelId);
  }
}
