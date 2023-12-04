import { Injectable, Logger } from '@nestjs/common';
import { ServerHomes } from 'src/database/server-homes.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomFieldsService {
  private logger = new Logger(CustomFieldsService.name);
  constructor(
    @InjectRepository(ServerHomes)
    private readonly repository: Repository<ServerHomes>,
  ) {}

  async for(home_path: string): Promise<ServerHomes> {
    this.logger.log('Getting custom fields for:', home_path);

    const entity = await this.repository.findOneByOrFail({ home_path });

    this.logger.log('Found:', JSON.stringify(entity));

    return entity;
  }
}
