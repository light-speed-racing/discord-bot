import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  exports: [HttpModule],
})
@Global()
export class CommonModule {}
