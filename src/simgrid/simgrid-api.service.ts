import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { RootConfig } from 'src/config/config';

@Injectable()
export class SimgridApi {
  private readonly logger = new Logger(SimgridApi.name);

  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  async championships() {
    const x = await firstValueFrom(
      this.http.get('v1/championships', { params: { status: 'active' } }).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );

    console.log(x.data);
  }
}
