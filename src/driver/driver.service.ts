import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { Repository } from 'typeorm';
import { GenericRepository } from 'src/shared';

@Injectable()
export class DriverService extends GenericRepository<Driver> {
  constructor(@InjectRepository(Driver) private readonly repo: Repository<Driver>) {
    super(repo);
  }
}
