import { Module } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerHomes } from 'src/database/server-homes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServerHomes])],
  providers: [CustomFieldsService],
  exports: [CustomFieldsService],
})
export class OpenGamePanelModule {}
