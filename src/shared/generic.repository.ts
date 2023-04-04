import { FindOptionsWhere, Repository } from 'typeorm';

export abstract class GenericRepository<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findOneBy(key: keyof T, value: string | number): Promise<T | null> {
    const entity = await this.repository.findOne({
      where: { [key]: value } as FindOptionsWhere<T>,
    });

    if (!entity) {
      return null;
    }

    return entity;
  }

  async createOrUpdate(input: T): Promise<T> {
    return this.repository.save(input);
  }
}
