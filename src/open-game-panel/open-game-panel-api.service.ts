import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { FileManagerModule } from './file-manager-module.type';
import { RootConfig } from 'src/config/config';

@Injectable()
export class OpenGamePanelApi {
  private readonly logger = new Logger(OpenGamePanelApi.name);
  constructor(private readonly http: HttpService, private readonly config: RootConfig) {}

  url<T extends keyof FileManagerModule>(module: T, parameters: FileManagerModule[T]) {
    const qs = new URLSearchParams();

    qs.set('token', this.config.openGamePanel.api_token);
    qs.set('ip', this.config.openGamePanel.ip);
    qs.set('mod_key', `default`);

    Object.entries(parameters).forEach(([key, value]) => {
      qs.set(key, `${value}`);
    });

    return new URL(`http://${this.config.openGamePanel.ip}/ogp_api.php?${module}&${qs}`);
  }

  async get<T extends keyof FileManagerModule, Message = string>(module: T, parameters: FileManagerModule[T]) {
    this.logger.verbose(`Fetching data using module: ${module}`);
    const { data } = await firstValueFrom(
      this.http.get<{ status: number; message: Message }>(`${this.url(module, parameters)}`).pipe(
        catchError((error: AxiosError) => {
          throw error.message;
        }),
      ),
    );
    return data;
  }
}
