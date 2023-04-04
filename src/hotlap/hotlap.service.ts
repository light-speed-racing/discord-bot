import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotlap } from './hotlap.entity';
import { Repository } from 'typeorm';
import { GenericRepository } from 'src/shared';

@Injectable()
export class HotlapService extends GenericRepository<Hotlap> {
  constructor(@InjectRepository(Hotlap) private readonly repo: Repository<Hotlap>) {
    super(repo);
  }
}
