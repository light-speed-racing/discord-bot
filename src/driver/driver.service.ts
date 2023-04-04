import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

abstract class GenericRepository<T> {
  constructor(private readonly genericRepo: Repository<T>) {}

  async findOneBy(key: keyof T, value: string | number): Promise<T | null> {
    const entity = await this.genericRepo.findOne({
      where: { [key]: value } as FindOptionsWhere<T>,
    });

    if (!entity) {
      return null;
    }

    return entity;
  }

  async createOrUpdate(input: T): Promise<T> {
    return this.genericRepo.save(input);
  }
}

@Injectable()
export class DriverService extends GenericRepository<Driver> {
  constructor(@InjectRepository(Driver) private readonly repo: Repository<Driver>) {
    super(repo);
  }
}
