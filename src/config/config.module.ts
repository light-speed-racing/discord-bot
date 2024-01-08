import { TypedConfigModule, dotenvLoader, selectConfig } from 'nest-typed-config';
import { RootConfig } from './config';

export const ConfigModule = TypedConfigModule.forRoot({
  schema: RootConfig,
  load: dotenvLoader({
    separator: '__',
  }),
});

export const rootConfig = selectConfig(ConfigModule, RootConfig);
