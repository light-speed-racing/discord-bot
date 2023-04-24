import { FindOptionsWhere, Repository } from 'typeorm';

export abstract class GenericRepository<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findOneBy(key: keyof T, value: string | number): Promise<T | null> {
    const entity = await this.repository.findOne({
      where: { [key]: value } as FindOptionsWhere<T>,
    });

    return entity ?? null;
  }

  async createOrUpdate(input: T): Promise<T> {
    return this.repository.save(input);
  }
}
