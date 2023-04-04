import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericRepository } from 'src/shared';
import { Lap } from './lap.entity';

@Injectable()
export class LapService extends GenericRepository<Lap> {
  constructor(@InjectRepository(Lap) private readonly repo: Repository<Lap>) {
    super(repo);
  }
}
