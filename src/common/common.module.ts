import { DynamicModule, Global, Module } from '@nestjs/common';
import { LiteFileManager } from './lite-file-manager.service';

@Global()
@Module({})
export class CommonModule {
  static register(): DynamicModule {
    const dependencies = [LiteFileManager];
    return {
      module: CommonModule,
      imports: [],
      providers: [...dependencies],
      exports: [...dependencies],
    };
  }
}
