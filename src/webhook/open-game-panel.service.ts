import { Injectable } from '@nestjs/common';
import { ServerHomes } from 'src/database/server-homes.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(ServerHomes)
    private readonly repository: Repository<ServerHomes>,
  ) {}

  async for(home_path: string): Promise<ServerHomes> {
    const entity = await this.repository.findOneByOrFail({ home_path });

    return entity;
  }
}
