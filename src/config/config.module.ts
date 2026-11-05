import { TypedConfigModule, dotenvLoader, selectConfig } from 'nest-typed-config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RootConfig } from './config';

export const ConfigModule = TypedConfigModule.forRoot({
  schema: RootConfig,
  load: dotenvLoader({
    separator: '__',
  }),
  validate: (rawConfig) => {
    // Resolve transformation metadata from this release, not the working directory's dependencies.
    const config = plainToInstance(RootConfig, rawConfig, { exposeDefaultValues: true });
    const errors = validateSync(config, {
      forbidUnknownValues: true,
      whitelist: true,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0) {
      throw new Error(TypedConfigModule.getConfigErrorMessage(errors));
    }
    return config;
  },
});

export const rootConfig = selectConfig(ConfigModule, RootConfig);
