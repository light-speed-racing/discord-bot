import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { rootConfig } from 'src/config/config.module';

export class SimgridHttpConfig implements HttpModuleOptionsFactory {
  private config = rootConfig;

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: `${this.config.simgrid.url}`,
      headers: {
        Authorization: `Bearer ${this.config.simgrid.token}`,
      },
    };
  }
}
