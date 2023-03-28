import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { CreateDriverDto } from './create-driver.dto';
import { UpdateDriverDto } from './update-driver.dto';

@Injectable()
export class DriverService {
  constructor(@InjectRepository(Driver) private readonly repository: Repository<Driver>) {}

  async findOneBy(key: keyof Driver, value: string): Promise<Driver | null> {
    return await this.repository.findOne({ where: { [key]: value } });
  }

  async create(input: CreateDriverDto): Promise<Driver> {
    const exists = await this.findOneBy('steamId', input.steamId);

    if (!!exists) {
      return this.update(input.steamId, { ...exists, ...input });
    }

    return this.repository.save(new Driver(input));
  }

  async update(steamId: string, input: UpdateDriverDto): Promise<Driver> {
    const entity = await this.repository.findOne({ where: { steamId } });
    return this.repository.save({ ...entity, ...input });
  }
}
