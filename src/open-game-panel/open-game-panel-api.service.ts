import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Module } from './module.type';
import { RootConfig } from 'src/config/config';

@Injectable()
export class OpenGamePanelApi {
  private readonly logger = new Logger(OpenGamePanelApi.name);
  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  url<T extends keyof Module>(module: T, parameters: Module[T]) {
    const qs = new URLSearchParams();

    qs.set('token', this.config.openGamePanel.apiToken);
    qs.set('ip', this.config.openGamePanel.ip);
    qs.set('mod_key', `default`);

    Object.entries(parameters).forEach(([key, value]) => {
      qs.set(key, `${value}`);
    });

    return new URL(`http://${this.config.openGamePanel.ip}/ogp_api.php?${module}&${qs}`);
  }

  async get<M extends keyof Module, Message = string>(module: M, parameters: Module[M]) {
    const url = this.url(module, parameters);
    this.logger.debug(`Fetching data from: ${url}`);
    const { data } = await firstValueFrom(
      this.http.get<{ status: number; message: Message }>(`${url}`).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );
    return data;
  }
}
