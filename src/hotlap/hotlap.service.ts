import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotlap } from './hotlap.entity';

@Injectable()
export class HotlapService {
  constructor(@InjectRepository(Hotlap) private readonly hotlapRepo: Repository<Hotlap>) {}
}
